import {
  b2i,
  ModelEnv, pb_axm_singleton_any,
  pb_axm_singleton_first,
  pb_eq,
  pb_exists, pb_exists_single,
  pb_forall,
  pb_singleton,
  pb_union_rows
} from "./index.js";
import {mk_ite} from "./utils.js";
import fs from "fs";
import path from "path";



// const k = 7

const gen = opts => {
  const opt_force_wcsd = false
  const opt_wcsd_forbid_div0 = true


  const uml = {
    // enums: {
    //   ExposureKind: ["EKOpen", "EKTunnel"]
    // },
    logic: "NIRA",
    name: `bart_${opt_force_wcsd ? "wcsd" : "model"}_${opt_wcsd_forbid_div0 ? "nodiv0" : "common"}`,
    // bound: k,
    classes: {
      train: {
        nose: "Real",
        v: "Real",
        a: "Real",
        vcm: "Real",
        acm: "Real",
        length: "Int"
      },
      station_computer: {},
      track: {},
      segment: {
        seg_begin: "Int",
        seg_end: "Int",
        length: "Int",
        civil_speed: "Int",
        grade: "Real",
        // exposure: "ExposureKind",
        is_exposure_open: "Bool",
      },
      station_platform: {
        _extends: ["segment"],
        station_name: "String"
      },
      gate: {open: "Bool"}
    },
    assoc: [
      {
        participants: [
          ["segment", "segment", 1, null, null],
          ["track", "track", null, 1, null]
        ],
      },
      {
        participants: [
          ["train", "train", null, null, null],
          ["track", "track", null, 1, null]
        ],
      },
      {
        participants: [
          ["station_computer", "scb", 0, null, 1],
          ["segment", "sb", null, 1, null]
        ],
      },
      {
        participants: [
          ["station_computer", "sce", 0, null, 1],
          ["segment", "se", null, 1, null]
        ],
      },
      {
        participants: [
          ["segment", "previous", 0, null, 1],
          ["segment", "next", 0, null, 1]
        ],
      },
      {
        participants: [
          ["train", "t1", null, null, null],
          ["station_platform", "orig", 0, null, 1]
        ],
      },
      {
        participants: [
          ["train", "t2", null, null, null],
          ["station_platform", "dest", 0, null, 1]
        ],
      },
      {
        participants: [
          ["gate", "gate", 0, null, 1],
          ["segment", "segment", null, 1, null]
        ]
      }
    ]
  }

  const e = new ModelEnv(uml, opts)

  const csg = "segment"
  const csp = "station_platform"
  const ctn = "train"
  const cg = "gate"
  const csc = "station_computer"
  const ctk = "track"

  const k_train = e.bound_of(ctn)
  const k_station_computer = e.bound_of(csc)
  const k_gate = e.bound_of(cg)
  const k_segment = e.bound_of(csg)
  const k_track = e.bound_of(ctk)

// --- next plus ---

  const cl_seg_next = []

  for (let i = 0; i < k_segment; i++) {
    const cl = e.assoc_closure_pb(csg, pb_singleton(k_segment, i, e.in_dom(csg, i)), (i, j) => e.assoc_coords(csg, "next", i, j), `cl_seg_next_${i}`)
    cl_seg_next.push(cl)
  }

// --- current seg ---

  for (let i = 0; i < k_train; i++) {
    // ensure such vec is singleton
    const current_seg = e.decl_pb(csg, `current_seg_${i}`)
    const segments = e.iterate_navigate(ctn, i, ["track", "segment"], ([i, tk, sg], _, conj) => {
      const select = `(and 
      (<= ${e.attr(csg, "seg_begin", sg)} ${e.attr(ctn, "nose", i)})
      (> ${e.attr(csg, "seg_end", sg)} ${e.attr(ctn, "nose", i)})
    )`
      return `(and ${conj.join(" ")} ${select})`
    }, xs => xs)

    const selected = e.decl_pb_cond(segments, `current_seg_selected_${i}`, e.in_dom(ctn, i))
    // e.named(`op_current_seg_first_${i}`, pb_axm_singleton_first(selected, current_seg))

    e.internal(`cus_op_current_seg_first_${i}`, `(ite ${e.in_dom(ctn, i)} ${pb_axm_singleton_first(selected, current_seg)} (and ${current_seg.map(it => `(not ${it})`).join(" ")}))`)
  }

  const op_current_seg = (trn) => {
    const k = e.bound_of(csg)
    const xs = []
    for (let j = 0; j < k; j++) {
      xs.push(`current_seg_${trn}_${j}`)
    }

    return xs
  }

  const cl_current_seg = []
  for (let i = 0; i < k_train; i++) {
    const current_seg = op_current_seg(i)
    // const current_seg_cl = current_seg.map((seg, i) => cl_seg_next[i].map(v => `(and ${seg} ${v})`))
    // const current_seg_cl_union = []
    const vs = []
    for (let sg = 0; sg < current_seg.length; sg++) {
      const cl_sg = cl_seg_next[sg]
      const v = cl_sg.map(cl => `(and ${current_seg[sg]} ${cl})`)
      vs.push(v)
    }

    cl_current_seg.push(pb_union_rows(vs))


    // cl_current_seg.push(e.assoc_closure_pb(
    //   csg,
    //   current_seg,
    //   (i, j) => e.assoc_coords(csg, "next", i, j),
    //   `cl_train_current_seg_${i}`
    // ))
  }

// --- station computer ---

  for (let i = 0; i < k_train; i++) {
    const station_computer_singleton = e.decl_pb(csc, `station_computer_${i}`)
    const xs = []
    const current_seg = op_current_seg(i)
    for (let j = 0; j < k_station_computer; j++) {
      const cl = cl_current_seg[i]
      const c1 = e.exists_navigate(csc, j, ["se"], ([j, se]) => cl[se])
      const c2 = e.exists_navigate(csc, j, ["sb"], ([j, sb]) => pb_exists_single(current_seg, (sg) => `(<= ${e.attr(csg, "seg_begin", sb)} ${e.attr(csg, "seg_begin", sg)})`))
      const c3 = e.exists_navigate(csc, j, ["se"], ([j, se]) => pb_exists_single(current_seg, (sg) => `(>= ${e.attr(csg, "seg_end", se)} ${e.attr(csg, "seg_end", sg)})`))

      xs.push(`(and ${e.in_dom(csc, j)} ${c1} ${c2} ${c3})`)
    }

    const selected = e.decl_pb_cond(xs, `station_computer_raw_${i}`, e.in_dom(ctn, i))
    // e.named(`op_station_computer_first_${i}`, pb_axm_singleton_first(selected, station_computer_singleton))
    e.internal(`cus_op_station_computer_first_${i}`, `(ite ${e.in_dom(ctn, i)} ${pb_axm_singleton_first(selected, station_computer_singleton)} (and ${station_computer_singleton.map(it => `(not ${it})`).join(" ")}))`)
  }

  const op_station_computer = trn => {
    const k = e.bound_of(csc)
    const xs = []
    for (let j = 0; j < k; j++) {
      xs.push(`station_computer_${trn}_${j}`)
    }

    return xs
  }

// --- trains ---

  for (let i = 0; i < k_station_computer; i++) {
    const trains = e.decl_pb(ctn, `trains_${i}`)
    const axm = []
    for (let j = 0; j < k_train; j++) {
      const c = pb_eq(op_station_computer(j), pb_singleton(k_station_computer, i))
      axm.push(`(= ${trains[j]} (and ${e.in_dom(ctn, j)} ${c}))`)
    }

    e.internal(`cus_op_trains_${i}`, `(ite ${e.in_dom(csc, i)} (and ${axm.join(" ")}) (and ${trains.map(it => `(not ${it})`).join(" ")}))`)
  }

  const op_trains = (sc) => {
    const k = e.bound_of(ctn)
    const xs = []
    for (let j = 0; j < k; j++) {
      xs.push(`trains_${sc}_${j}`)
    }

    return xs
  }

// --- next closed gate ---



  for (let i = 0; i < k_train; i++) {
    const cl = cl_current_seg[i]
    const collected = []

    for (let g = 0; g < k_gate; g++) {
      const disj = []
      for (let sg = 0; sg < k_segment; sg++) {
        disj.push(`(and ${cl[sg]} ${e.assoc_coords(csg, "gate", sg, g)} (not ${e.attr(cg, "open", g)}))`)
      }
      collected.push(`(or ${disj.join(" ")})`)
    }

    const raw = e.decl_pb_cond(collected, `next_closed_gate_raw_${i}`, e.in_dom(ctn, i))

    const gate_singleton = e.decl_pb(cg, `next_closed_gate_${i}`)
    const gs_neg = gate_singleton.map(it => `(not ${it})`).join(" ")
    const disj = [
      `(and (= 0 (+ ${raw.map(b2i).join(" ")})) ${gs_neg})`,
    ]

    for (let g = 0; g < k_gate; g++) {
      const conj = []
      for (let g2 = 0; g2 < k_gate; g2++) {
        if (g2 !== g) {
          // g < g2
          const cond = e.exists_navigate(cg, g, ["segment"], ([g, s1]) => e.exists_navigate(cg, g, ["segment"], ([g2, s2]) => `(< 
          ${e.attr(csg, "seg_end", s1)}
          ${e.attr(csg, "seg_end", s2)}
        )`))

          conj.push(`(or (not ${raw[g2]}) (and ${raw[g2]} ${cond}))`)
        }
      }

      const neg = gate_singleton.map((v, i) => i === g ? v : `(not ${v})`).join(" ")
      disj.push(`(and ${raw[g]} ${neg} ${conj.join(" ")})`)
    }

    e.internal(`cus_next_closed_gate_${i}`, `(ite ${e.in_dom(ctn, i)} (or ${disj.join(" ")}) (and ${gs_neg}))`)
  }

  const op_next_closed_gate = (trn) => {
    const k = e.bound_of(cg)
    const xs = []
    for (let j = 0; j < k; j++) {
      xs.push(`next_closed_gate_${trn}_${j}`)
    }

    return xs
  }

// --- current trains ---

  for (let i = 0; i < k_segment; i++) {
    const trains = e.decl_pb(ctn, `current_trains_${i}`)
    const axm = []
    for (let j = 0; j < k_train; j++) {
      const c = pb_eq(op_current_seg(j), pb_singleton(k_segment, i))
      axm.push(`(= ${trains[j]} (and ${e.in_dom(ctn, j)} ${c}))`)
    }

    const neg = trains.map(it => `(not ${it})`).join(" ")

    e.internal(`cus_op_current_trains_${i}`, `(ite ${e.in_dom(csg, i)} (and ${axm.join(" ")}) (and ${neg}))`)
  }

  const op_current_trains = (sg) => {
    const k = e.bound_of(ctn)
    const xs = []
    for (let j = 0; j < k; j++) {
      xs.push(`current_trains_${sg}_${j}`)
    }

    return xs
  }

// --- next train ---

  for (let i = 0; i < k_train; i++) {
    const cl = cl_current_seg[i]
    const collected = []

    for (let t = 0; t < k_train; t++) {
      const disj = []
      for (let sg = 0; sg < k_segment; sg++) {
        const is_in = op_current_trains(sg)[t]
        const cond = `(> 
        ${e.attr(ctn, "nose", t)}
        ${e.attr(ctn, "nose", i)}
      )`

        disj.push(`(and ${cl[sg]} ${is_in} ${cond})`)
      }

      collected.push(`(or ${disj.join(" ")})`)
    }

    const raw = e.decl_pb_cond(collected, `next_train_raw_${i}`, e.in_dom(ctn, i))

    const train_singleton = e.decl_pb(ctn, `next_train_${i}`)
    const ts_neg = train_singleton.map(it => `(not ${it})`).join(" ")
    const disj = [
      `(and (= 0 (+ ${raw.map(b2i).join(" ")})) ${ts_neg})`,
    ]

    for (let t = 0; t < k_train; t++) {
      const conj = []
      for (let t2 = 0; t2 < k_train; t2++) {
        if (t2 !== t) {
          // g < g2
          const cond = `(< 
          ${e.attr(ctn, "nose", t)}
          ${e.attr(ctn, "nose", t2)}
        )`

          conj.push(`(or (not ${raw[t2]}) (and ${raw[t2]} ${cond}))`)
        }
      }

      const neg = train_singleton.map((v, i) => i === t ? v : `(not ${v})`).join(" ")
      disj.push(`(and ${raw[t]} ${neg} ${conj.join(" ")})`)
    }

    e.internal(`cus_next_train_${i}`, `(ite ${e.in_dom(ctn, i)} (or ${disj.join(" ")}) (and ${ts_neg}))`)
  }

  const op_next_train = trn => {
    const k = e.bound_of(ctn)
    const xs = []
    for (let j = 0; j < k; j++) {
      xs.push(`next_train_${trn}_${j}`)
    }

    return xs
  }

// --- WCSD ---

// sg_ = t.current_seg()
  const src_wcsd = `
(define-fun op_wcsd ((sg_grade Real) (sg_exp_open Bool) (trn_v Real) (trn_a Real)) Real (let 
  (
    (pu 3.0) (puf 6) (tjp 1.5) (ap 3) (ad 2)
    (ncar 10) (nfail 2) (nfsmc 2) (mc 1) (jb (- 1.5))
    (fsmc 8.5) (vf 0)

    (a (/ (* (- 21.9) sg_grade) 100))
    (brk (ite 
      sg_exp_open
      (- 1.5)
      (- 2.0)
    ))
  )
  (let 
    (
      (d1 (* puf pu))
      (d2 (* ad trn_v))
      (jp (/ ap tjp))
      (tjb (/ brk jb))
      (qfsmc (/ (- (- ncar nfail) nfsmc) ncar))
    )
    (let (
      (d3 (+ 
        (* trn_v tjp)
        (* 0.5 ap tjp tjp)
        (* (/ 1 6) jp tjp tjp tjp)
        (* 0.5 a tjp tjp)
      ))
      (v3 (+ 
        trn_v
        (* ap tjp)
        (* 0.5 jp tjp tjp)
        (* a tjp)
      ))
    ) (let (
      (d4 (+ (* v3 mc) (* 0.5 a mc mc)))
      (v4 (+ v3 (* a mc)))
    ) (let (
      (d5 (+ 
        (* v4 tjb)
        (* (/ 1 6) jb qfsmc tjb tjb tjb)
        (* 0.5 a tjb tjb)
      ))
      (v5 (+ 
        v4
        (* 0.5 jb qfsmc tjb tjb)
        (* a tjb)
      ))
      (t6 (- fsmc tjp mc tjb))
      (bfs (* brk qfsmc))
      (q (/ (- ncar nfail) ncar))
    ) (let (
      (d6 (+ 
        (* v5 t6)
        (* 0.5 bfs t6 t6)
        (* 0.5 a t6 t6)
      ))
      (v6 (+ 
        v5
        (* bfs t6)
        (* a t6)
      ))
    ) (let (
      (d7 (/ 
        (- (* vf vf) (* v6 v6))
        (* 2 (+ a (* brk q)))
      ))
    ) (ite 
      (< trn_a 0)
      (+ d1 d2 d7)
      (+ d1 d2 d3 d4 d5 d6 d7)
    ))))))
  )
))
`

  e.def_fun(`op_wcsd`, src_wcsd, true)

  const src_wcsd_pre = `
(define-fun op_wcsd_pre ((sg_grade Real) (sg_exp_open Bool)) Bool (let (
  (ncar 10) (nfail 2)
  (a (/ (* (- 21.9) sg_grade) 100))
  (brk (ite 
    sg_exp_open
    (- 1.5)
    (- 2.0)
  ))
) (let (
  (q (/ (- ncar nfail) ncar))
) (and 
  (distinct (* 2 (+ a (* brk q))) 0)
))))
`

  if (opt_wcsd_forbid_div0) {
    e.def_fun(`op_wcsd_pre`, src_wcsd_pre, true)
  }


// const op_wcsd = (trn, f) => pb_exists_single(op_current_seg(trn), (sg) => {
//   const params = [
//     e.attr(csg, "grade", sg),
//     e.attr(csg, "is_exposure_open", sg),
//     e.attr(ctn, "v", trn),
//     e.attr(ctn, "a", trn)
//   ]
//   return f(`(op_wcsd ${params.join(" ")})`)
// })

// this works while the exists version not??? why???
// this works while the exists version not??? why???
// this works while the exists version not??? why???
// this works while the exists version not??? why???
// this works while the exists version not??? why???
  const op_wcsd = (trn, f) => {
    const br_t_sg_grade = []
    const br_t_sg_exp = []
    const crsg = op_current_seg(trn)
    for (let i = 0; i < k_segment; i++) {
      br_t_sg_grade.push([crsg[i], e.attr(csg, "grade", i)])
      br_t_sg_exp.push([crsg[i], e.attr(csg, "is_exposure_open", i)])
    }

    const expr_t_sg_grade = mk_ite(br_t_sg_grade, null)
    const expr_t_sg_exposure = mk_ite(br_t_sg_exp, null)

    const params = [
      expr_t_sg_grade,
      expr_t_sg_exposure,
      e.attr(ctn, "v", trn),
      e.attr(ctn, "a", trn)
    ]

    return f(`(op_wcsd ${params.join(" ")})`)
  }

  const op_wcsd_pre = trn => {
    if (!opt_wcsd_forbid_div0) {
      return `true`
    }
    const br_t_sg_grade = []
    const br_t_sg_exp = []
    const crsg = op_current_seg(trn)
    for (let i = 0; i < k_segment; i++) {
      br_t_sg_grade.push([crsg[i], e.attr(csg, "grade", i)])
      br_t_sg_exp.push([crsg[i], e.attr(csg, "is_exposure_open", i)])
    }

    const expr_t_sg_grade = mk_ite(br_t_sg_grade, null)
    const expr_t_sg_exposure = mk_ite(br_t_sg_exp, null)

    const params = [
      expr_t_sg_grade,
      expr_t_sg_exposure,
    ]

    return `(op_wcsd_pre ${params.join(" ")})`
  }

// --- inv ---

  e.assert_context(
    csg,
    e.forall_instances(csg, (sg) => `(=>
    (distinct ${e.assoc_path_size_pb(csg, sg, ["next"])} 0)
    ${e.exists_navigate(csg, sg, ["next"], ([sg, sgn]) => `(=
      ${e.attr(csg, "seg_begin", sgn)}
      ${e.attr(csg, "seg_end", sg)}
    )`)}
  )`),
    e.forall_instances(csg, (sg) => `(=
    ${e.attr(csg, "length", sg)}
    (- ${e.attr(csg, "seg_end", sg)} ${e.attr(csg, "seg_begin", sg)})
  )`),

    e.forall_instances(csg, (sg) => `(=>
    (distinct ${e.assoc_path_size_pb(csg, sg, ["next"])} 0)
    ${e.exists_navigate(csg, sg, ["next"], ([sg, sgn]) => pb_eq(
      e.assoc_vec(csg, sg, ["track"]),
      e.assoc_vec(csg, sgn, ["track"])
    ))}
  )`),
  )

  e.assert_context(
    ctn,
    e.forall_instances(ctn, (tn) => e.forall_navigate(ctn, tn, ["orig"], ([tn, sp]) => e.exists_cast(csp, sp, csg, (sg) => {
      // const cl = e.assoc_closure_pb(
      //   csg,
      //   pb_singleton(k, sg),
      //   (i, j) => e.assoc_coords(csg, "next", i, j),
      //   `cl_train_sg_next_${tn}_${sp}_${sg}`
      // )

      const cl = cl_seg_next[sg]

      return e.exists_navigate(ctn, tn, ["dest"], ([tn, spd]) => e.exists_cast(csp, spd, csg, (sgd) => cl[sgd]))
    }))),

    e.forall_instances(ctn, (tn) => `(and
    (>= ${e.attr(ctn, "vcm", tn)} 0)
    (<= ${e.attr(ctn, "vcm", tn)} 80)
  )`),

    e.forall_instances(ctn, (tn) => `(or
    (and (>= ${e.attr(ctn, "acm", tn)} 0) (<= ${e.attr(ctn, "acm", tn)} 3))
    (and (>= ${e.attr(ctn, "acm", tn)} (- 2)) (<= ${e.attr(ctn, "acm", tn)} (- 0.45)))
  )`),
  )

  e.assert_context(
    csc,
    e.forall_instances(csc, (sc) => e.exists_navigate(csc, sc, ["sb"], ([sc, sg]) => {
      // const cl = e.assoc_closure_pb(
      //   csg,
      //   pb_singleton(k, sg),
      //   (i, j) => e.assoc_coords(csg, "next", i, j),
      //   `cl_sc_sg_next_${sc}_${sg}`
      // )
      const cl = cl_seg_next[sg]
      return e.exists_navigate(csc, sc, ["se"], ([sc, sge]) => cl[sge])
    })),

    // e.forall_instances(csc, ([sc]) => pb_forall(
    //   op_trains(sc),
    //   (tn) => pb_exists_single(op_current_seg(tn), (sg) => `(<= ${e.attr(ctn, "v", tn)} ${e.attr(csg, "civil_speed", sg)})`)
    // )),

    e.forall_instances(csc, (sc) => e.forall_instances(ctn, tn => {
      const c = pb_exists_single(op_current_seg(tn), (sg) => `(<= ${e.attr(ctn, "v", tn)} ${e.attr(csg, "civil_speed", sg)})`)
      return `(=> ${op_trains(sc)[tn]} ${c})`
    })),

    e.forall_instances(csc, (sc) => pb_forall(op_trains(sc), tn => {
      const ncg = op_next_closed_gate(tn)
      const cond = pb_exists(ncg, g => e.exists_navigate(cg, g, ["segment"], ([g, sg]) => op_wcsd(tn, (wcsd) => `(<
      (+ ${e.attr(ctn, "nose", tn)} ${wcsd})
      ${e.attr(csg, "seg_end", sg)}
    )`)))

      const pre = op_wcsd_pre(tn)

      return `(=>
      (distinct 0 (+ ${ncg.map(b2i).join(" ")}))
      (and ${pre} ${cond})
    )`
    })),
    e.forall_instances(csc, (sc) => pb_forall(op_trains(sc), tn => {
      const nt = op_next_train(tn)
      const cond = pb_exists_single(nt, tnn => op_wcsd(tn, (wcsd) => `(<
      (+ ${e.attr(ctn, "nose", tn)} ${wcsd})
      (- ${e.attr(ctn, "nose", tnn)} ${e.attr(ctn, "length", tnn)})
    )`))

      const pre = op_wcsd_pre(tn)


      return `(=>
      (distinct 0 (+ ${nt.map(b2i).join(" ")}))
      (and ${pre} ${cond})
    )`
    })),

    // e.forall_instances(csc, ([sc]) => e.forall_instances(ctn, ([tn]) => {
    //   const ncg = op_next_closed_gate(tn)
    //   // const cond = pb_exists(ncg, g => e.exists_navigate(cg, g, ["segment"], ([g, sg]) => op_wcsd(tn, (wcsd) => `(<
    //   //   (+ ${e.attr(ctn, "nose", tn)} ${wcsd})
    //   //   ${e.attr(csg, "seg_end", sg)}
    //   // )`)))
    //   const cond = true
    //   const cond_full = `(=>
    //     (distinct 0 (+ ${ncg.map(b2i).join(" ")}))
    //     ${cond}
    //   )`
    //   return `(=> ${op_trains(sc)[tn]} ${cond_full})`
    // })),
    //
    // e.forall_instances(csc, ([sc]) => e.forall_instances(ctn, ([tn]) => {
    //   const nt = op_next_train(tn)
    //   const cond = pb_exists_single(nt, tnn => op_wcsd(tn, (wcsd) => `(<
    //     (+ ${e.attr(ctn, "nose", tn)} ${wcsd})
    //     (- ${e.attr(ctn, "nose", tnn)} ${e.attr(ctn, "length", tnn)})
    //   )`))
    //
    //   // const cond = `(<
    //   //   (+ ${e.attr(ctn, "nose", tn)} )
    //   //   (- ${})
    //   // )`
    //
    //   return `(=> ${op_trains(sc)[tn]} (=>
    //     (distinct 0 (+ ${nt.map(b2i).join(" ")}))
    //     ${cond}
    //   ))`
    // })),

    // e.exists_instances(csc, ([sc]) => `(and
    //   ${e.exists_instances(ctn, ([tn]) => `(and
    //     ${op_trains(sc)[tn]}
    //     (= (+ ${op_current_seg(tn).join(" ")}) 1)
    //   )`)}
    // )`)
  )

  if (opt_force_wcsd) {
    // forcing inst. of assoc to ensure sat wcsd is found
    e.internal("cus_opt_force_wcsd_next_trains", e.forall_instances(csc, (sc) => pb_exists(op_trains(sc), trn => `(distinct 0 (+ ${op_next_train(trn).map(b2i).join(" ")}))`)))
    e.internal("cus_opt_force_wcsd_next_closed_gate", e.forall_instances(csc, (sc) => pb_exists(op_trains(sc), trn => `(distinct 0 (+ ${op_next_closed_gate(trn).map(b2i).join(" ")}))`)))

    e.internal("cus_opt_force_wcsd_decided_first", e.forall_instances(ctn, (trn) => {
      const xs = []
      const ys = []
      for (let i = 0; i < k_track * k_segment; i++) {
        const id = `current_seg_selected_${trn}_${i}`
        xs.push(id)
      }

      for (let i = 0; i < k_station_computer; i++) {
        const id = `station_computer_raw_${trn}_${i}`
        ys.push(id)
      }

      return `(and 
    (<= 1 (+ ${xs.map(b2i).join(" ")}))
    (<= 1 (+ ${ys.map(b2i).join(" ")}))
  )`
    }))
  }

  return e
}

export default gen

