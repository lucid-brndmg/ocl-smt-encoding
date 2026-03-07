import {ModelEnv, pb_eq, pb_or, pb_singleton} from "./index.js";
import fs from "fs";
import path from "path";
import {gen_fml} from "./utils.js"

const gen = opts => {

  const uml = {
    name: "train",
    logic: "SLIA",
    classes: {
      train: {},
      waggon: {
        num_of_seats: "Int"
      },
      journey: {},
      station: {
        name: "NullableString"
      },
      way: {},
      reservation: {
        seat_number: "Int"
      },
    },
    assoc: [
      {
        participants: [
          ["train", "train", null, 1, null],
          ["waggon", "waggon", 1, null, null]
        ]
      },
      {
        participants: [
          ["waggon", "successor", 0, null, 1],
          ["waggon", "predecessor", 0, null, 1],
        ]
      },
      {
        participants: [
          ["journey", "journey", null, null, null],
          ["train", "train", null, 1, null]
        ]
      },
      {
        participants: [
          ["journey", "journey", null, null, null],
          ["way", "way", null, 1, null]
        ]
      },
      {
        participants: [
          ["way", "way", null, null, null],
          ["station", "station", 2, null, null, true]
        ]
      },
      {
        participants: [
          ["station", "from_station", null, 1, null],
          ["reservation", "res_from", null, null, null]
        ]
      },
      {
        participants: [
          ["station", "to", null, 1, null],
          ["reservation", "res_to", null, null, null]
        ]
      },
      {
        participants: [
          ["reservation", "reservation", null, null, null],
          ["journey", "journey", null, 1, null],
        ]
      },
      {
        participants: [
          ["reservation", "reservation", null, null, null],
          ["waggon", "waggon", null, 1, null]
        ]
      }
    ]
  }

  const e = new ModelEnv(uml, opts)

  const ct = "train"
  const cw = "waggon"
  const cj = "journey"
  const cs = "station"
  const cway = "way"
  const cr = "reservation"

  e.assert_context(
    ct,
    e.forall_instances(ct, (t) => e.exists_navigate(ct, t, ["waggon"], ([t, w]) => {
      const cl = e.assoc_closure_pb(
        cw,
        e.assoc_vec(cw, w, ["predecessor"]),
        (i, j) => e.assoc_coords(cw, "predecessor", i, j),
        `cl_pred_${t}_${w}`
      )
      const vw = e.assoc_vec(ct, t, ["waggon"])

      return `(and 
      (not ${cl[w]})
      ${pb_eq(vw, pb_or(cl, pb_singleton(cl.length, w)))}
    )`
    })),
    e.forall_instances(ct, (t) => `(<= ${e.assoc_path_size_pb(ct, t, ["waggon"])} 50)`),

  )

  e.assert_context(
    cs,
    e.forall_instances(cs, (s) => `(and
    (distinct ${e.attr(cs, "name", s)} ${e.mk_nil("NullableString")})
    ${e.assoc_each_distinct(cs, s, [], (s1, s2) => `(distinct ${e.attr(cs, "name", s1)} ${e.attr(cs, "name", s2)})`)}
  )`)
  )

  e.assert_context(
    cway,
    e.forall_instances(cway, (w) => e.assoc_each_distinct(cway, w, [], (w1, w2) => `(not ${pb_eq(
      e.assoc_vec(cway, w1, ["station"]),
      e.assoc_vec(cway, w2, ["station"]),
    )})`))
  )

  e.unnamed(e.forall_instances(cr, (r) => {
    const p_station = ["journey", "way", "station"]
    const c1 = `(and
      ${e.assoc_path_includes(cr, r, p_station, ["from_station"])}
      ${e.assoc_path_includes(cr, r, p_station, ["to"])}
    )`
    const c2 = e.exists_navigate(cr, r, ["from_station"], ([r, s_f]) => e.exists_navigate(cr, r, ["to"], ([r, s_t]) => e.exists_navigate(cr, r, ["journey", "way"], ([r, j, w]) => {
      const i_from = e.ord_assoc_index_of(cway, w, "station", s_f)
      const i_to = e.ord_assoc_index_of(cway, w, "station", s_t)

      return `(< ${i_from} ${i_to})`
    })))

    return `(and
      ${c1}
      ${c2}
    )`
  }))

  // e.unnamed(e.forall_instances(cr, ([r]) => `(> ${e.attr(cr, "seat_number", r)} 0)`))
  // e.unnamed(e.forall_instances(cr, ([r]) => e.exists_navigate(cr, r, ["waggon"], ([r, w]) => `(<=
  //     ${e.attr(cr, "seat_number", r)}
  //     ${e.attr(cw, "num_of_seats", w)}
  //   )`)))

  e.unnamed(e.forall_instances(cr, (r) => `(and
    (> ${e.attr(cr, "seat_number", r)} 0)
    ${e.exists_navigate(cr, r, ["waggon"], ([r, w]) => `(<=
      ${e.attr(cr, "seat_number", r)}
      ${e.attr(cw, "num_of_seats", w)}
    )`)}
  )`))

  // e.assert_context(
  //   cr,
  //   // --- v1
  //   // e.forall_instances(cr, ([r]) => {
  //   //   const p_station = ["journey", "way", "station"]
  //   //   return `(and
  //   //     ${e.assoc_path_includes(cr, r, p_station, ["from_station"])}
  //   //     ${e.assoc_path_includes(cr, r, p_station, ["to"])}
  //   //     ${e.exists_navigate(cr, r, ["journey", "way"], ([r, j, w]) => {
  //   //       return e.exists_navigate(cr, r, ["from_station"], ([r, s_f]) =>
  //   //         e.exists_navigate(cr, r, ["to"], ([r, s_t]) => {
  //   //           const i_from = e.ord_assoc_index_of(cway, w, "station", s_f)
  //   //           const i_to = e.ord_assoc_index_of(cway, w, "station", s_t)
  //   //           return `(< ${i_from} ${i_to})`
  //   //         })
  //   //       )
  //   //     })}
  //   //   )`
  //   // }),
  //
  //   // --- v2
  //   e.forall_instances(cr, ([r]) => {
  //     const p_station = ["journey", "way", "station"]
  //     const c1 = `(and
  //     ${e.assoc_path_includes(cr, r, p_station, ["from_station"])}
  //     ${e.assoc_path_includes(cr, r, p_station, ["to"])}
  //   )`
  //     const c2 = e.exists_navigate(cr, r, ["from_station"], ([r, s_f]) => e.exists_navigate(cr, r, ["to"], ([r, s_t]) => e.exists_navigate(cr, r, ["journey", "way"], ([r, j, w]) => {
  //       const i_from = e.ord_assoc_index_of(cway, w, "station", s_f)
  //       const i_to = e.ord_assoc_index_of(cway, w, "station", s_t)
  //
  //       return `(< ${i_from} ${i_to})`
  //     })))
  //
  //     return `(and
  //     ${c1}
  //     ${c2}
  //   )`
  //   }),
  //
  //   e.forall_instances(cr, ([r]) => `(and
  //   (> ${e.attr(cr, "seat_number", r)} 0)
  //   ${e.exists_navigate(cr, r, ["waggon"], ([r, w]) => `(<=
  //     ${e.attr(cr, "seat_number", r)}
  //     ${e.attr(cw, "num_of_seats", w)}
  //   )`)}
  // )`)
  // )

  e.assert_context(
    cj,
    e.forall_instances(cj, (j) => e.forall_navigate(cj, j, ["train", "waggon"], ([j, t, w]) => e.assoc_each_distinct(cw, w, ["reservation"], (r1, r2) => {
      // NOT overlaps
    //   const cond = e.exists_navigate(cj, j, ["way"], ([j, way]) => `(and
    //   ${e.exists_navigate(cr, r2, ["to"], ([r2, s_to]) => e.exists_navigate(cr, r1, ["from_station"], ([r1, s_from]) => {
    //     const i_to = e.ord_assoc_index_of(cway, way, "station", s_to)
    //     const i_from = e.ord_assoc_index_of(cway, way, "station", s_from)
    //     return `(> ${i_to} ${i_from})`
    //   }))}
    //
    //   ${e.exists_navigate(cr, r1, ["to"], ([r1, s_to]) => e.exists_navigate(cr, r2, ["from_station"], ([r2, s_from]) => {
    //     const i_to = e.ord_assoc_index_of(cway, way, "station", s_to)
    //     const i_from = e.ord_assoc_index_of(cway, way, "station", s_from)
    //     return `(> ${i_to} ${i_from})`
    //   }))}
    // )`)
      // const cond = `foo_${r1}_${r2}`
      const cond = e.exists_navigate(cj, j, ["way"], ([j, way]) => `overlaps_${r1}_${r2}_${way}`)
      return `(or
      (distinct ${e.attr(cr, "seat_number", r1)} ${e.attr(cr, "seat_number", r2)})
      (not ${cond})
    )`
    })))
  )

  const k_way = e.bound_of(cway)
  const k_r = e.bound_of(cr)
  for (let r1 = 0; r1 < k_r; r1++) {
    for (let r2 = 0; r2 < k_r; r2++) {
      e.decl_pb(cway, `overlaps_${r1}_${r2}`)
    }
  }

  for (let way = 0; way < k_way; way++) {
    const axm = []
    for (let r1 = 0; r1 < k_r; r1++) {
      for (let r2 = 0; r2 < k_r; r2++) {
        const cond = `(and
      ${e.exists_navigate(cr, r2, ["to"], ([r2, s_to]) => e.exists_navigate(cr, r1, ["from_station"], ([r1, s_from]) => {
          const i_to = e.ord_assoc_index_of(cway, way, "station", s_to)
          const i_from = e.ord_assoc_index_of(cway, way, "station", s_from)
          return `(> ${i_to} ${i_from})`
        }))}

      ${e.exists_navigate(cr, r1, ["to"], ([r1, s_to]) => e.exists_navigate(cr, r2, ["from_station"], ([r2, s_from]) => {
          const i_to = e.ord_assoc_index_of(cway, way, "station", s_to)
          const i_from = e.ord_assoc_index_of(cway, way, "station", s_from)
          return `(> ${i_to} ${i_from})`
        }))}
    )`
        axm.push(`(= overlaps_${r1}_${r2}_${way} (and ${cond} ${e.in_dom(cway, way)} ${e.in_dom(cr, r1)} ${e.in_dom(cr, r2)}))`)
      }
    }

    e.internal(`cus_op_overlaps_${way}`, `(and ${axm.join(" ")})`)
  }

  return e
}

export default gen