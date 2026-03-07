import * as path from "path";
import fs from "fs";
import {sum, prod, idx_compose, idx_decompose, graph_closure, each_distinct, mk_options, mk_ite, lst, set_intersection} from "./utils.js";


// export const id_assoc_accessor = (c, f) => `assoc_${c}_${f}`
export const bvt = n => `(_ BitVec ${n})`
export const bv = (x, n) => `(_ bv${x} ${n})`


// export const id_dom_size = c => `d_${c}_size`
// export const id_dom_size_nat = c => `d_${c}_l`

// export const id_dom_size_pseudo = (c, s) => `d_${c}_size_${s}`

// export const id_assoc_mat_pref = (c1, f1, c2, f2) => `a_${c1}_${f1}_${c2}_${f2}`
// export const id_inh_mat_pref = (c, p) => `e_${c}_${p}`

export const id_tbl_coords = (pref, coords) => `${pref}_${coords.join("_")}`
export const id_mat_coords = (pref, i, j) => id_tbl_coords(pref, [i, j]) // `${pref}_${i}_${j}`
// export const id_assoc_tbl_pref = ptc => `n_${ptc.map(([c, f]) => `${c}_${f}`).join("_")}`

// export const id_class_attr = (classname, field, i) => `t_${classname}_${field}_${i}`
// export const id_class_attr_accessor = (classname, field) => `t_${classname}_${field}`
// export const id_ord_assoc_size = (classname, field) => `assoc_${classname}_${field}_size`
// export const id_ord_assoc_size = (classname, field, i) => `assoc_${classname}_${field}_s${i}`

// export const id_ord_mat_coords = (pref, field, s, index, t) => `o_${pref}_${field}_${s}_${index}_${t}`

// export const id_ord_mat_inv = (pref, field, s, t) => `p_${pref}_${field}_${s}_${t}`

// export const id_class_cast = (src, tgt) => `cast_${src}_${tgt}`
// export const id_class_instances = (cln, i) => `d_${cln}_inst_${i}`

// export const id_tuple_constructor = ty => `mk-${ty}`
// export const id_tuple_null = ty => `mk-${ty}-null`
// export const id_tuple_field = (ty, i) => `${ty}_${i}`

export const bvn = k => Math.ceil(Math.log2(k + 1))
export const bvk = n => (1 << n) - 1

// export const not_null = (k, e) => `(distinct ${e} ${bv((1 << k) - 1)})`



export const bv_active = (k, n, id, i) => {
  const pad = `(concat (_ bv0 ${k - n}) ${i})`
  const s = `(bvshl (_ bv1 ${k}) ${pad})`
  return `(= ${s} (bvand ${id} ${s}))`
}

export const bv_includes = (src, t) => {
  return `(= ${t} (bvand ${src} ${t}))`
}

export const mk_popcount = k => {
  const n = bvn(k)
  const rows = []
  for (let i = 0; i < k; i++) {
    rows.push(`(ite (= #b1 ((_ extract ${i} ${i}) t)) ${bv(1, n)} ${bv(0, n)})`)
  }
  return `(define-fun popcount${k} ((t ${bvt(k)})) ${bvt(n)} (bvadd ${rows.join("\n")}))`
}

export const mk_fold_bv = (ak, k) => {
  const expr = []
  const a = Math.floor(ak / k)
  for (let i=0; i < a; i++) {
    expr.push(`((_ extract ${(i+1) * k -1} ${i * k}) t)`)
  }

  return `(define-fun fold-bv_${ak}_${k} ((t ${bvt(ak)})) ${bvt(k)} (bvor ${expr.join("\n")}))`
}

export const mk_lb = (k) => {
  const body = `(popcount${k} (bvsub (bvand i (bvneg i)) (_ bv1 ${k})))`
  return `(define-fun lb${k} ((i (_ BitVec ${k}))) (_ BitVec ${bvn(k)}) ${body})`
}

export const mk_closure = (k) => {
  const ks = k**2
  // const union_body = []
  const prop_body = []
  for (let i = 0; i < k; i++) {
    // union_body.push(`((_ extract ${(i+1) * k - 1} ${i * k}) t)`)
    prop_body.push(`(ite (= #b1 ((_ extract ${i} ${i}) t)) ${bv((1 << k) - 1, k)} ${bv(0, k)})`)
  }


  const cl_prop = `(define-fun cl_prop${k} ((t ${bvt(k)})) ${bvt(ks)} (concat ${prop_body.reverse().join("\n")}))`
  // const cl_union = `(define-fun cl_union${k} ((t ${bvt(ks)})) ${bvt(k)} (bvor ${union_body.join("\n")}))`

  let expr = "x"
  for (let i = 0; i < k - 1; i++) {
    // x1 = x0 | cl_union(cl_prop(x0) & t)
    expr = `(bvor ${expr} (fold-bv_${ks}_${k} (bvand (cl_prop${k} ${expr}) t)))`
  }

  return [
    cl_prop,
    // cl_union,
    `(define-fun closure${k} ((t ${bvt(ks)}) (x ${bvt(k)})) ${expr})`
  ]
}



const mk_uf_wired_aux = (pref, path, bv_params, ret, fn_param = "x", depth = 0, decl = []) => {
  if (bv_params.length === 1) {
    // const bv_param = bv_params[0]
    // const k = (1 << bv_param) - 1
    const k = bv_params[0]
    const bv_param = bvn(k)
    const br = []
    const br_inv = []
    for (let i = 0; i < k; i ++) {
      const id = [
        pref,
        ...path.map(([i]) => i),
        i
      ].join("_")
      // const id = `${pref}_${path.map(([i]) => i).concat([i]).join("_")}`
      decl.push(`(declare-const ${id} ${ret})`)
      br.push([`(= ${fn_param}_${depth} ${bv(i, bv_param)})`, id])
      br_inv.push([`(= ${fn_param}_${depth} ${id})`, bv(i, bv_param)])
      // br_inv.push([`(= ${fn_param}_${depth} (${pref} ${path.map(([x, n]) => bv(x, n)).join(" ")} ${bv(i, bv_param)}))`, bv(i, bv_param)])
    }
    return [mk_ite(br, null), br_inv]
  }

  const [hd, ...tl] = bv_params

  const br = []
  const br_inv = []
  for (let i = 0; i < hd; i ++) {
    const [lbr, lbr_inv] = mk_uf_wired_aux(pref, [...path, [i, hd]], tl, ret, fn_param, depth + 1, decl)
    br.push([`(= ${fn_param}_${depth} ${bv(i, bvn(hd))})`, lbr])
    br_inv.push(...lbr_inv)
  }

  return [mk_ite(br, null), br_inv]
}

export const mk_uf_wired_k = (pref, ks, ret, with_inverse) => {
  const decl = []
  const [br, br_inv] = mk_uf_wired_aux(pref, [], ks, ret, `x`, 0, decl)
  const params = ks.map((k, i) => `(x_${i} ${bvt(bvn(k))})`)

  decl.push(`(define-fun ${pref} (${params.join(" ")}) ${ret} ${br})`)
  if (with_inverse) {
    const inv_params = [...params]
    const last = inv_params.length - 1
    inv_params[last] = `(x_${last} ${ret})`
    decl.push(`(define-fun ${pref}_inv (${inv_params.join(" ")}) ${bvt(bvn(ks[last]))} ${mk_ite(br_inv, null)})`)
  }

  return decl
}

// export const ord_assoc_set_axiom_mat_pb = (k_s, k_t, c, f, is_row, pref) => {
//   const n = bvn(k_t)
//   const n_s = bvn(k_s)
//   const axiom = []
//   const acc = id_ord_assoc_acc(c, f)
//   const acc_inv = `${acc}_inv`
//   const acc_size = id_ord_assoc_size(c, f)
//   for (let i = 0; i < k_s; i++) {
//     const conj = []
//     for (let j = 0; j < k_t; j ++) {
//       const disj = []
//       for (let k = 0; k < k_t; k++) {
//         const active = is_row ? `${pref}_${i}_${k}` : `${pref}_${k}_${i}`
//         disj.push(`(and ${active} (= ${bv(k, n)} (${acc} ${bv(i, n_s)} ${bv(j, n)})))`)
//       }
//       const disj_expr = `(and (or ${disj.join(" ")}) (= ${bv(j, n)} (${acc_inv} ${bv(i, n_s)} (${acc} ${bv(i, n_s)} ${bv(j, n)}))))`
//       conj.push(`(ite (bvult ${bv(j, n)} (${acc_size} ${bv(i, n_s)})) ${disj_expr} (= ${bv(k_t, n)} (${acc} ${bv(i, n_s)} ${bv(j, n)})))`)
//     }
//     // (bvult i d_${c1}_size)
//
//     axiom.push(`(=> ${id_class_instances(c, i)} (and ${conj.join(" ")}))`)
//   }
//
//   return `(and ${axiom.join(" ")})`
// }

// export const of_composite_index = (idx, ks) => {
//   // of_composite_index
//
//   // for (let i=0; i < k1*k2*k3*k4; i++) {console.log(
//   //   i,
//   //   Math.floor(i / (k2*k3*k4)),
//   //   Math.floor((i / (k3*k4)) % k2),
//   //   Math.floor((i / k4) % k3),
//   //   i % k4
//   // )}
//
//   // const K = ks.reduce((acc, i) => acc * i, 1)
//   const xs = []
//   for (let i = 0; i < ks.length; i++) {
//     const k = ks[i]
//     const next = ks.slice(i + 1)
//     if (next.length) {
//       // todo: /=
//       const k_next = next.reduce((acc, k) => acc * k, 1)
//       let result = Math.floor(idx / k_next)
//       if (i !== 0) {
//         result = result % k
//       }
//       xs.push(result)
//     } else {
//       xs.push(idx % k)
//     }
//   }
//
//   return xs
// }

// export const to_composite_index = (idx_combo, ks) => {
//   if (ks.length !== idx_combo.length) {
//     throw new Error("Invalid index combo")
//   }
//
//   let result = 1
//   for (let i = 0; i < idx_combo.length; i++) {
//     result += idx_combo[i] * ks.slice(i+1).reduce((acc, k) => acc * k, 1)
//   }
//
//   return result
// }

// export const iter_composite_index = (i, ks, ksi) => {
//   // ksi: row(0) or column(1) of binary
//   // table column for n-ary
//
//   const K = ks.reduce((acc, k) => acc * k, 1)
//   const result = []
//   for (let j = 0; j < K; j++) {
//     const resolved = idx_decompose(j, ks)
//     if (resolved[ksi] === i) {
//       result.push(j)
//     }
//   }
//
//   return result
// }

// export const pb_mat_gen = (pref, is_row, k1, k2, classname, lo1, eq1, hi1) => {
//   const nullable1 = lo1 === 0 && hi1 === 1
//   const single1 = eq1 === 1
//   const n1 = bvn(k1)
//   const n2 = bvn(k2)
//   const sel = []
//   const sel_size = []
//   const axiom = []
//   const mat = []
//   for (let i=0; i<k1; i++) {
//     const row = []
//     for (let j=0; j<k2; j++) {
//       const ident = is_row
//         ? id_mat_coords(pref, i, j) // `${pref}_${id1}_${id2}_${i}_${j}`
//         : id_mat_coords(pref, j, i) // `${pref}_${id2}_${id1}_${j}_${i}`
//       row.push(ident)
//       mat.push(ident)
//     }
//
//     if (nullable1 || single1) {
//       const row_sel1 = []
//       for (let j=0; j<k2; j++) {
//         row_sel1.push([row[j], bv(j, n2)])
//       }
//       sel.push([`(= x ${bv(i, n1)})`, mk_ite(row_sel1, nullable1 ? bv(k2, n2) : null)])
//     } else {
//       sel_size.push([`(= x ${bv(i, n1)})`, `((_ int2bv ${n2}) (+ ${row.join(" ")}))`])
//       const row_bv = `(concat ${row.map(ident => `(ite ${ident} #b1 #b0)`).reverse().join(" ")})`
//       sel.push([`(= x ${bv(i, n1)})`, row_bv])
//     }
//
//     const card = []
//
//     if (lo1 != null) {
//       card.push(`(>= (+ ${row.join(" ")}) ${lo1})`)
//     }
//     if (hi1 != null) {
//       card.push(`(<= (+ ${row.join(" ")}) ${hi1})`)
//     }
//     if (eq1 != null) {
//       card.push(`(= (+ ${row.join(" ")}) ${eq1})`)
//     }
//     const is_null_then = `(and ${row.map(ident => `(not ${ident})`).join(" ")})`
//     if (card.length) {
//       axiom.push(`(ite ${id_class_instances(classname, i)} (and ${card.join(" ")}) ${is_null_then})`)
//     } else {
//       axiom.push(`(=> (not ${id_class_instances(classname, i)}) ${is_null_then})`)
//     }
//
//     // const is_null_cond = `(bvult ${id_dom_size(classname)} ${bv(i+1, n1)})`
//     // const is_null_cond = `(bvult ${id_dom_size(classname)} ${bv(i+1, n1)})`
//     // const is_null_then = `(and ${row.map(ident => `(not ${ident})`).join(" ")})`
//     //
//     // if (card.length) {
//     //   axiom.push(`(ite ${is_null_cond} ${is_null_then} (and ${card.join(" ")}))`)
//     // } else {
//     //   axiom.push(`(=> ${is_null_cond} ${is_null_then})`)
//     // }
//
//   }
//
//   return [
//     axiom,
//     mat,
//     `(concat ${mat.map(e => `(ite ${e} #b1 #b0)`).reverse().join(" ")})`,
//     mk_ite(sel, null),
//     mk_ite(sel_size, null),
//   ]
// }


export const mkp = (p) => {
  return p.split(".").map(it => it.trim()).filter(it => it)
}



export const AssocMode = {
  Row: 1,
  Col: 2,
  ToAssoc: 3,
  FromAssoc: 4
}



export const b2i = expr => `(ite ${expr} 1 0)`


export const pb_eq = (v1, v2) => {
  if (v1.length !== v2.length) {
    return `true`
  }

  const xs = []
  for (let i = 0; i < v1.length; i++) {
    xs.push(`(= ${v1[i]} ${v2[i]})`)
  }
  return `(and ${xs.join(" ")})`
}

export const pb_singleton = (k, i, cond = "true") => {
  const xs = []
  for (let j = 0; j < k; j++) {
    if (i === j) {
      xs.push(cond)
    } else {
      xs.push(`false`)
    }
  }

  return xs
}

export const pb_or = (v1, v2) => {
  const xs = []
  const m = Math.max(v1.length, v2.length)
  for (let i = 0; i < m; i++) {
    xs.push(`(or ${v1[i] ?? "false"} ${v2[i] ?? "false"})`)
  }
  return xs
}

export const pb_and = (v1, v2) => {
  const xs = []
  const m = Math.max(v1.length, v2.length)
  for (let i = 0; i < m; i++) {
    xs.push(`(and ${v1[i] ?? "false"} ${v2[i] ?? "false"})`)
  }
  return xs
}

export const pb_exists = (v, f) => {
  const xs = []
  for (let i = 0; i < v.length; i++) {
    xs.push(`(and ${v[i]} ${f(i)})`)
  }

  return `(or ${xs.join(" ")})`
}

export const pb_exists_single = (v, f) => {
  const xs = []
  for (let i = 0; i < v.length; i++) {
    const cond = v.map((it, j) => i === j ? it : `(not ${it})`).join(" ")
    xs.push(`(and ${cond} ${f(i)})`)
  }

  return `(or ${xs.join(" ")})`
}

export const pb_forall = (v, f) => {
  const xs = []
  for (let i = 0; i < v.length; i++) {
    xs.push(`(=> ${v[i]} ${f(i)})`)
  }

  return `(and ${xs.join(" ")})`
}

export const pb_axm_singleton_any = (v_src, v_tgt) => {
  const k = v_tgt.length
  const ak = v_src.length
  const a = Math.floor(ak / k)

  const axiom = [
    // nothing in bag yields nothing
    `(and (= 0 (+ ${v_src.map(b2i).join(" ")})) ${v_tgt.map(it => `(not ${it})`).join(" ")})`
  ]

  for (let i = 0; i < k; i++) {
    const single = `(and ${v_tgt.map((v, j) => i === j ? v : `(not ${v})`).join(" ")} )`
    const disj = []

    for (let j = 0; j < a; j++) {
      const idx = j * k + i
      disj.push(v_src[idx])
    }

    axiom.push(`(and ${single} (or ${disj.join(' ')}))`)
  }

  return `(or ${axiom.join(" ")})`
}

export const pb_axm_singleton_first = (v_src, v_tgt) => {
  const k = v_tgt.length
  const ak = v_src.length

  const axiom = [
    // nothing in bag yields nothing
    `(and (= 0 (+ ${v_src.map(b2i).join(" ")})) ${v_tgt.map(it => `(not ${it})`).join(" ")})`
  ]

  for (let i = 0; i < ak; i++) {
    const src_neg = v_src.slice(0, i).map(v => `(not ${v})`)
    // const single_src = `(and ${v_src.map((v, j) => i === j ? v : `(not ${v})`).join(" ")} )`
    const m = i % k
    const single_tgt = `(and ${v_tgt.map((v, j) => m === j ? v : `(not ${v})`).join(" ")} )`
    axiom.push(`(and ${src_neg.join(" ")} ${v_src[i]} ${single_tgt})`)
  }

  return `(or ${axiom.join(" ")})`
}

export const pb_union_rows = (xs) => {
  const v = []
  for (let i = 0; i < xs.length; i++) {
    const row = xs[i]
    for (let j = 0; j < row.length; j++) {
      if (v[j]) {
        v[j].push(row[j])
      } else {
        v[j] = [row[j]]
      }
    }
  }

  return v.map(xs => `(or ${xs.join(" ")})`)
}

export const pb_fold = (xs, k) => {
  const ak = xs.length
  const xss = []
  for (let i = 0; i < ak; i++) {
    const slot = i % k
    if (!xss[slot]) {
      xss[slot] = [xs[i]]
    } else {
      xss[slot].push(xs[i])
    }
  }


  return xss.map(xs => `(or ${xs.join(" ")})`)

  // const expr = []
  // const a = Math.floor(ak / k)
  // for (let i=0; i < a; i++) {
  //   expr.push(`((_ extract ${(i+1) * k -1} ${i * k}) t)`)
  // }
}

export const pb_sum = (xs) => `(+ ${xs.map(b2i).join(" ")})`



// export const gen_fml_batch = (es, solvers, p = "gen/") => {
//   // if (!es.length) {
//   //   throw new Error("Invalid model environments list")
//   // }
//
//   const solver_exec = []
//
//   for (let solver of solvers) {
//     const {name, exec, support} = solver
//     const e0 = es[0]
//     const basename = `${name}_${e0.uml.name}`
//     const log_name = `${name}_results.txt`
//     const sh_name = `${basename}_exec.sh`
//     const sh_lines = [
//       `echo ":model:${e0.filename()}" >> ${log_name}`,
//       `echo ":classes:${e0.class_summary.size}" >> ${log_name}`,
//
//     ]
//
//     if (!support || support(e0.logic_est())) {
//       solver_exec.push({
//         name,
//         exec,
//         basename,
//         log_name,
//         sh_lines,
//         sh_name,
//       })
//     } else {
//       console.log(`skip ${basename}`)
//     }
//   }
//
//   for (let e of es) {
//     const smt = gen_fml(e, p)
//     const inst = e.total_bound()
//
//     for (let {sh_lines, exec, log_name} of solver_exec) {
//       sh_lines.push(`echo ":inst:${inst}" >> ${log_name}`)
//       sh_lines.push(`${exec(smt)} >> ${log_name}`)
//       sh_lines.push(`echo ":done:" >> ${log_name}`)
//       sh_lines.push(`echo "done ${smt}"`)
//     }
//
//     console.log("---")
//   }
//
//   // for (let i = range_lo; i < range_hi + 1; i++) {
//   //   console.log(`k = ${i}`)
//   //   const e = gen(i, ...options)
//   //   if (!classes_written) {
//   //     sh_lines.push(`echo "classes:${e.class_summary.size}" >> ${log_name}`)
//   //   }
//   //   const smt = gen_fml(e, p)
//   //   sh_lines.push(`${solver_cli(smt)} >> ${log_name}`)
//   //   sh_lines.push(`echo "done ${i}"`)
//   //   console.log("---")
//   // }
//
//   for (let {sh_lines, sh_name} of solver_exec) {
//     const sh = sh_lines.join("\n")
//     const sh_file = path.join(p, sh_name)
//     fs.writeFileSync(sh_file, sh, "utf8")
//     // console.log(`exec: ${sh_file}`)
//   }
//   return solver_exec
// }

// export const gen_fml_soft_bound = (e, range_lo, range_hi) => {
//   const fml = e.generate(false)
//   const s = [fml]
//   for (let i = range_lo; i < range_hi + 1; i++) {
//     s.push(`(push)`)
//     const conj = []
//     for (let c of Object.keys(e.uml.classes)) {
//       if (!e.class_summary.get(c).assoc_class_mat) {
//         const sz = id_dom_size_nat(c)
//         conj.push(`(<= ${sz} ${i})`)
//       }
//     }
//     s.push(`(assert (and ${conj.join(" ")}))`)
//     s.push(`(check-sat)`)
//     // s.push(`(get-model)`)
//     // s.push(`(get-info :time)`)
//     // s.push(`(get-info :memory)`)
//     s.push(`(pop)`)
//   }
//
//   return s.join("\n")
// }



const pb_dot_prod = (m1, k1, m2, k2, mr, kr) => {
  // information of kr is lost in mr

  const rows = []
  const cols = []
  for (let i = 0; i < k1; i++) {
    const row = []
    for (let j = 0; j < kr; j++) {
      const id = id_mat_coords(m1, i, j)
      row.push(id)
    }
    rows.push(row)
  }

  for (let i = 0; i < k2; i++) {
    const col = []
    for (let j = 0; j < kr; j++) {
      const id = id_mat_coords(m2, j, i)
      col.push(id)
    }
    cols.push(col)
  }

  const axiom = []
  // resulting mat sized k1 * k2
  for (let i = 0; i < k1; i++) {
    const row = rows[i]
    for (let j = 0; j < k2; j++) {
      const col = cols[j]
      const id = id_mat_coords(mr, i, j)
      axiom.push(`(= ${id} (distinct ${pb_sum(pb_and(row, col))} 0))`)
    }
  }

  return `(and ${axiom.join(" ")})`
}


// todo: pb_mask, pb_xor

// const builtin_assertion_prefix = [
//   "cr_inh",
//   "assoc_",
//   "n_assoc_",
//   "ord_",
//   "to_assoc_",
//   "class_inst_",
//   "closure_",
//   "pb_",
//   "enum_",
//   "cus_"
// ]

export class ModelEnv {
  uml
  options
  class_summary = new Map()
  class_inheritance_graph = {}
  class_inheritance_indirect = {}

  assertions = []
  assertion_internal = []
  assertion_internal_names = []
  assertion_names = []
  unnamed_declarations = []

  unnamed_assertion_id = 0

  registered_builtin_sorts = new Map()

  // pop-count-k, etc
  registered_builtins = new Map()
  registered_functions = new Map()

  ctx_assertion_count = new Map()
  attr_ref = new Map()
  trans_cl = false

  id_mapping = {
    type_id: 0,
    attr_id: 0,
    assoc_2_id: 0,
    assoc_n_id: 0,
    inh_id: 0,
    class_id: 0,

    type: new Map(), // type name
    attr: new Map(), // classname:attr
    inh: new Map(), // cl1:cl2
    assoc: new Map(), // a1:...:an, re-register binary for n-ary
    classes: new Map()
  }

  // in_domain(cl, i) {
  //   const sum = this.class_summary.get(cl)
  //   if (this.options.dense_instance && !sum.assoc_class_mat) {
  //     return `(< ${i} ${id_dom_size_nat(cl)})`
  //   } else {
  //     return id_class_instances(cl, i)
  //   }
  // }

  // ord_assoc_axiom(k_s, k_t, c, f, is_row, pref) {
  //   // const n = bvn(k_t)
  //   // const n_s = bvn(k_s)
  //   const axiom = []
  //   const acc = id_ord_assoc_acc(c, f)
  //   const acc_inv = `${acc}_inv`
  //   const acc_size = id_ord_assoc_size(c, f)
  //   for (let i = 0; i < k_s; i++) {
  //     const conj = []
  //     const coords = []
  //     for (let j = 0; j < k_t; j ++) {
  //       const disj = []
  //       for (let k = 0; k < k_t; k++) {
  //         const active = is_row ? id_mat_coords(pref, i, k) : id_mat_coords(pref, k, i)
  //         // disj.push(`(and ${active} (= ${bv(k, n)} (${acc} ${bv(i, n_s)} ${bv(j, n)})))`)
  //         disj.push(`(and ${active} (= ${k} ${acc}_${i}_${j}))`)
  //       }
  //       // const disj_expr = `(and (or ${disj.join(" ")}) (= ${bv(j, n)} (${acc_inv} ${bv(i, n_s)} (${acc} ${bv(i, n_s)} ${bv(j, n)}))))`
  //       // or (and (= j inv_i_0) (= 0 acc_i_j))
  //       const inv_expr = []
  //       for (let k = 0; k < k_t; k++) {
  //         inv_expr.push(`(and (= ${j} ${acc_inv}_${i}_${k}) (= ${k} ${acc}_${i}_${j}))`)
  //       }
  //       const disj_expr = `(and ${disj.join(" ")} (or ${inv_expr.join(" ")}))`
  //
  //       // conj.push(`(ite (bvult ${bv(j, n)} (${acc_size} ${bv(i, n_s)})) ${disj_expr} (= ${bv(k_t, n)} (${acc} ${bv(i, n_s)} ${bv(j, n)})))`)
  //       conj.push(`(ite (< ${j} ${acc_size}_${i}) ${disj_expr} (= ${k_t} ${acc}_${i}_${j}))`)
  //       coords.push(is_row ? id_mat_coords(pref, i, j) : id_mat_coords(pref, j, i))
  //     }
  //     conj.push(`(= ${acc_size}_${i} (+ ${coords.map(b2i).join(" ")}))`)
  //
  //     axiom.push(`(=> ${this.in_dom(c, i)} (and ${conj.join(" ")}))`)
  //   }
  //
  //   return `(and ${axiom.join(" ")})`
  // }

  filename() {
    const sat = this.options.sat
      ? "sat"
      : this.options.core ? "core" : "unsat"

    // _${this.total_bound()}
    return `${this.uml.name ?? "model"}_${sat}_${this.options.unbounded_compatible ? "c" : "f"}_${this.options.bound}${this.options.filename_suffix ?? ""}`
  }

  ord_mat_gen(pref, is_row, k1, k2, classname, field) {
    const axiom = []
    for (let i = 0; i < k1; i++) {
      const size_ident = this.v_assoc_ord_size(pref, is_row, i)
      this.decl_const(size_ident, `Int`)
      // const row = []
      for (let j = 0; j < k2; j++) {
        const row = []
        for (let k = 0; k < k2; k++) {
          const ident = this.v_assoc_ord_index(pref, is_row, i, j, k) // id_ord_mat_coords(pref, field, i, j, k)
          row.push(ident)
          this.decl_const(ident, `Bool`)
        }
        const card = `(= 1 (+ ${row.map(b2i).join(" ")}))`
        const not_active = `(and ${row.map(id => `(not ${id})`).join(" ")})`
        const is_active = `(< ${j} ${size_ident})`
        axiom.push(`(ite ${is_active} ${card} ${not_active})`)
      }
      const row = []
      for (let j = 0; j < k2; j++) {
        const col = []
        const cond = []
        const inv = this.v_assoc_ord_inv(pref, is_row, i, j)
        this.decl_const(inv, `Int`)

        for (let k = 0; k < k2; k++) {
          const ident = this.v_assoc_ord_index(pref, is_row, i, k, j) // id_ord_mat_coords(pref, field, i, k, j) // `${pref}_ord_${i}_${k}_${j}`
          col.push(ident)
          cond.push(`(and ${ident} (= ${inv} ${k}))`)
        }

        // uniqueness
        const card = `(and (or ${cond.join(" ")}) (= 1 (+ ${col.map(b2i).join(" ")})))`
        // not in association set
        const not_active = `(and (= ${inv} ${k2}) ${col.map(it => `(not ${it})`).join(" ")})`
        const is_active = is_row
          ? id_mat_coords(pref, i, j)
          : id_mat_coords(pref, j, i)
        axiom.push(`(ite ${is_active} ${card} ${not_active})`)
        row.push(is_active)
      }
      axiom.push(`(= ${size_ident} (+ ${row.map(b2i).join(" ")}))`)
    }

    return axiom
  }

  pb_mat_gen(pref, is_row, k1, k2, classname, lo1, eq1, hi1) {
    // const nullable1 = lo1 === 0 && hi1 === 1
    // const single1 = eq1 === 1
    // const n1 = bvn(k1)
    // const n2 = bvn(k2)
    // const sel = []
    // const sel_size = []
    const axiom = []
    const mat = []
    for (let i=0; i<k1; i++) {
      const row = []
      for (let j=0; j<k2; j++) {
        const ident = is_row
          ? id_mat_coords(pref, i, j) // `${pref}_${id1}_${id2}_${i}_${j}`
          : id_mat_coords(pref, j, i) // `${pref}_${id2}_${id1}_${j}_${i}`
        row.push(ident)
        mat.push(ident)
      }

      // if (nullable1 || single1) {
      //   const row_sel1 = []
      //   for (let j=0; j<k2; j++) {
      //     row_sel1.push([row[j], bv(j, n2)])
      //   }
      //   sel.push([`(= x ${bv(i, n1)})`, mk_ite(row_sel1, nullable1 ? bv(k2, n2) : null)])
      // } else {
      //   sel_size.push([`(= x ${bv(i, n1)})`, `((_ int2bv ${n2}) (+ ${row.join(" ")}))`])
      //   const row_bv = `(concat ${row.map(ident => `(ite ${ident} #b1 #b0)`).reverse().join(" ")})`
      //   sel.push([`(= x ${bv(i, n1)})`, row_bv])
      // }

      const card = []

      const row_pb = row.map(b2i)

      if (lo1 != null) {
        card.push(`(>= (+ ${row_pb.join(" ")}) ${lo1})`)
      }
      if (hi1 != null) {
        card.push(`(<= (+ ${row_pb.join(" ")}) ${hi1})`)
      }
      if (eq1 != null) {
        card.push(`(= (+ ${row_pb.join(" ")}) ${eq1})`)
      }
      const is_null_then = `(and ${row.map(ident => `(not ${ident})`).join(" ")})`
      if (card.length) {
        axiom.push(`(ite ${this.in_dom(classname, i)} (and ${card.join(" ")}) ${is_null_then})`)
      } else {
        axiom.push(`(=> (not ${this.in_dom(classname, i)}) ${is_null_then})`)
      }

      // const is_null_cond = `(bvult ${id_dom_size(classname)} ${bv(i+1, n1)})`
      // const is_null_cond = `(bvult ${id_dom_size(classname)} ${bv(i+1, n1)})`
      // const is_null_then = `(and ${row.map(ident => `(not ${ident})`).join(" ")})`
      //
      // if (card.length) {
      //   axiom.push(`(ite ${is_null_cond} ${is_null_then} (and ${card.join(" ")}))`)
      // } else {
      //   axiom.push(`(=> ${is_null_cond} ${is_null_then})`)
      // }

    }

    return [
      axiom,
      mat,
      // `(concat ${mat.map(e => `(ite ${e} #b1 #b0)`).reverse().join(" ")})`,
      // mk_ite(sel, null),
      // mk_ite(sel_size, null),
    ]
  }

  class_id(classname) {
    if (this.id_mapping.classes.has(classname)) {
      return this.id_mapping.classes.get(classname)
    }
    const id = this.id_mapping.class_id ++
    this.id_mapping.classes.set(classname, id)
    return id
  }

  type_id(type_name) {
    if (this.id_mapping.type.has(type_name)) {
      return this.id_mapping.type.get(type_name)
    }

    const id = this.id_mapping.type_id ++
    this.id_mapping.type.set(type_name, id)
    return id
  }

  attr_id(classname, attr) {
    const cmp = `${classname}:${attr}`
    if (this.id_mapping.attr.has(cmp)) {
      return this.id_mapping.attr.get(cmp)
    }

    const id = this.id_mapping.attr_id ++
    this.id_mapping.attr.set(cmp, id)
    return id
  }

  assoc_binary_id(classname_row, field_row, classname_col, field_col) {
    const cmp = `${classname_row}_${field_row}:${classname_col}_${field_col}`
    if (this.id_mapping.assoc.has(cmp)) {
      return this.id_mapping.assoc.get(cmp)
    }

    const id = this.id_mapping.assoc_2_id ++
    this.id_mapping.assoc.set(cmp, id)
    return id
  }

  assoc_n_id(ptc) {
    const cf = ptc.map(([c, f]) => `${c}_${f}`).join(":")
    if (this.id_mapping.assoc.has(cf)) {
      return this.id_mapping.assoc.get(cf)
    }

    const id = this.id_mapping.assoc_n_id ++
    this.id_mapping.assoc.set(cf, id)
    return id
  }

  inh_id(child, parent) {
    const cmp = `${child}:${parent}`
    if (this.id_mapping.inh.has(cmp)) {
      return this.id_mapping.inh.get(cmp)
    }

    const id = this.id_mapping.inh_id ++
    this.id_mapping.inh.set(cmp, id)
    return id
  }

  _register_assoc_single(src, tgt, assoc_class, mode, mat_pref) {
    const [src_class, src_field] = src
    const [tgt_class, field, lo, eq, hi, is_ord] = tgt
    const sum_src = this.class_summary.get(src_class)
    if (sum_src.associations[field]) {
      throw new Error(`Duplicated association: ${src_class}.${field}`)
    }
    sum_src.associations[field] = {
      classname: tgt_class,
      target_field: src_field, // field at target class: tgt.src_field = src_class
      is_ordered: is_ord,
      source_class: src_class,
      source_field: field, // field at source class
      is_single: lo === 0 && hi === 1 || eq === 1,
      is_nullable: lo === 0 && hi === 1,
      card: [lo, eq, hi],
      mode,
      mat_pref,
      bv_mat: false // generate concrete BV matrix? (for closure)
    }
    if (assoc_class) {
      sum_src.associations[assoc_class] = {
        classname: assoc_class,
        target_field: src_field, // u.src_field = src_class
        is_ordered: is_ord,
        source_class: src_class,
        source_field: assoc_class,
        is_single: lo === 0 && hi === 1 || eq === 1,
        is_nullable: lo === 0 && hi === 1,
        card: [lo, eq, hi],
        mode: AssocMode.ToAssoc,
        mat_pref,
        bv_mat: false
      }

      const sum_assoc = this.class_summary.get(assoc_class)

      if (sum_assoc.associations[src_field]) {
        throw new Error(`Duplicated association: ${assoc_class}.${src_field}`)
      }

      sum_assoc.associations[src_field] = {
        classname: src_class,
        target_field: assoc_class, // src.u = u
        is_ordered: is_ord,
        source_class: assoc_class,
        source_field: src_field,
        is_single: true,
        is_nullable: false,
        card: [null, 1, null],
        mode: AssocMode.FromAssoc,
        mat_pref,
        bv_mat: false
      }
    }
  }

  _register_assoc(assoc, assoc_class = null) {
    const {participants, is_unary} = assoc
    const is_n_ary = participants.length > 2
    for (let [src, tgt] of each_distinct(participants)) {
      const mat_pref = this.v_assoc_2_pref(src[0], tgt[1], tgt[0], src[1])
      if (is_unary) {
        this._register_assoc_single(src, tgt, assoc_class, AssocMode.Row, mat_pref)
      } else {
        this._register_assoc_single(src, tgt, assoc_class, AssocMode.Row, mat_pref)
        this._register_assoc_single(tgt, src, assoc_class, AssocMode.Col, mat_pref)
      }
    }

    if (is_n_ary) {
      this.n_ary_assoc_constraint(participants)
    }

    // let [src, tgt] = participants
    // const mat_pref = id_assoc_mat_pref(src[0], tgt[1], tgt[0], src[1])
    //
    // if (is_unary) {
    //   this._register_assoc_single(src, tgt, assoc_class, AssocMode.Row, mat_pref)
    // } else {
    //   this._register_assoc_single(src, tgt, assoc_class, AssocMode.Row, mat_pref)
    //   this._register_assoc_single(tgt, src, assoc_class, AssocMode.Col, mat_pref)
    // }
  }

  _register_popcount(k) {
    const body = mk_popcount(k)
    const name = `popcount${k}`
    this.registered_builtins.set(name, body)
    return name
  }

  _register_fold(ak, k) {
    const body = mk_fold_bv(ak, k)
    const id = `fold-bv_${ak}_${k}`
    this.registered_builtins.set(id, body)
    return id
  }

  _register_lb(k) {
    this._register_popcount(k)
    const name = `lowbit${k}`
    const body = mk_lb(k)
    this.registered_builtins.set(name, body)
    return name
  }

  _register_closure(k) {
    const id_closure = `closure${k}`
    const id_prop = `cl_prop${k}`
    this._register_fold(k**2, k)
    const [prop, cl] = mk_closure(k)
    this.registered_builtins.set(id_closure, cl)
    this.registered_builtins.set(id_prop, prop)

    return id_closure
  }

  _register_nullable_sort(t) {
    const kind = `Nullable${t}`
    const ident = this.ty(kind)

    const v = `(declare-datatypes ((${ident} 0)) (
  ((${this.mk(kind)} (content ${t})) (${this.mk_nil(kind)}))
))`
    this.registered_builtin_sorts.set(ident, v)
  }

  ty(type_name) {
    const id = this.type_id(type_name)
    return `T${id}`
  }

  mk(type_name) {
    const id = this.type_id(type_name)
    return `mk${id}`
  }

  mk_nil(type_name) {
    const id = this.type_id(type_name)
    return `mk${id}n`
  }

  enum(member) {
    return `e${this.type_id(member)}`
  }

  tuple(type_name, index) {
    return `${this.ty(type_name)}_${index}`
  }

  v_attr(classname, field, i) {
    return `r${this.attr_id(classname, field)}_${i}`
  }

  accessor_attr(classname, field) {
    return `fr${this.attr_id(classname, field)}`
  }

  v_class_inst(classname, i) {
    return `I${this.class_id(classname)}_${i}` // id_class_instances()
  }

  v_class_size(classname) {
    return `L${this.class_id(classname)}`
  }

  v_class_size_pseudo(classname, i) {
    return this.v_class_size(classname) + `_${i}`
  }

  v_inh_pref(child, parent) {
    return `E${this.inh_id(child, parent)}`
  }

  v_assoc_2_pref(c1, f1, c2, f2) {
    return `A${this.assoc_binary_id(c1, f1, c2, f2)}`
  }

  v_assoc_n_pref(ptc) {
    return `P${this.assoc_n_id(ptc)}`
  }

  v_assoc_ord_size(mat_pref, is_row, i) {
    // return `OS${this.}`
    return `${is_row ? "OR" : "OC"}${mat_pref}_${i}`
  }

  v_assoc_ord_index(mat_pref, is_row, s, i, t) {
    return `${is_row ? "OR" : "OC"}${mat_pref}_${s}_${i}_${t}`
  }

  v_assoc_ord_inv(mat_pref, is_row, s, t) {
    return `${is_row ? "OIR" : "OIC"}${mat_pref}_${s}_${t}`
  }

  decl_const(v, ty) {
    if (this.registered_builtins.has(v)) {
      throw new Error(`Duplicated const decl ${v} : ${ty}`)
    }
    this.registered_builtins.set(v, `(declare-const ${v} ${ty})`)
  }

  def_fun(name, code, force = false) {
    if (this.options.lite && !force) {
      if (!this.options.silent) {
        console.log(`skip decl-fun ${name}`)
      }
      return
    }

    // (define-fun ...)
    if (this.registered_functions.has(name)) {
      throw new Error(`Duplicated fun decl ${name} : ${code}`)
    }

    this.registered_functions.set(name, code)
  }

  decl_accessor(classname, field) {
    const sum = this.class_summary.get(classname)
    if (!sum.attributes[field]) {
      throw new Error(`Invalid attribute ${classname}.${field}`)
    }

    const br = []
    for (let i = 0; i < sum.bound; i++) {
      br.push([`(= x ${i})`, this.v_attr(classname, field, i)])
    }
    const body = mk_ite(br, null)
    const id = this.accessor_attr(classname, field)
    this.def_fun(id, `(define-fun ${id} ((x Int)) ${sum.attributes[field]} ${body})`, true)

    return id
  }

  // stream

  constructor(uml, options) {
    if (!options) {
      throw new Error("No configuration specified")
    }

    // const s = fs.openSync("gen/demo.smt2", "w")
    // this.stream = s

    this.uml = uml
    this.options = options // ?? mk_options()
    const classnames = Object.keys(uml.classes)
    const acc_bound = new Map()
    for (let class_name of classnames) {
      const class_decl = uml.classes[class_name]
      // let is_assoc_class = false
      let assoc_class_mat = null
      let assoc_class_classes = []
      let attributes = {}
      let bound = options.bound
      if (class_name === this.options.ig_class && this.options.ig_bound) {
        bound = this.options.ig_bound
      }
      for (let attr of Object.keys(class_decl)) {
        switch (attr) {
          case "_bound": {
            if (class_decl["_assoc"]) {
              throw new Error("Invalid bound over assoc class")
            }
            bound = class_decl["_bound"]
            break
          }
          case "_extends": {
            const inh_classes = class_decl["_extends"]
            for (let from of inh_classes) {
              if (this.class_inheritance_graph[from]) {
                this.class_inheritance_graph[from].push(class_name)
              } else {
                this.class_inheritance_graph[from] = [class_name]
              }
            }
            break
          }
          case "_assoc": {
            let ptc = class_decl["_assoc"].participants
            let k = 1
            for (let [ptc_class] of ptc) {
              k *= acc_bound.get(ptc_class)
              assoc_class_classes.push(ptc_class)
            }
            bound = k
            // is_assoc_class = true
            assoc_class_mat = ptc.length <= 2
              ? this.v_assoc_2_pref(ptc[0][0], ptc[1][1], ptc[1][0], ptc[0][1])
              : this.v_assoc_n_pref(ptc)

            break
          }
          default: {
            const ty = class_decl[attr]
            if (ty.startsWith("Nullable")) {

              const id = ty.slice(`Nullable`.length)
              this._register_nullable_sort(id)
            }
            attributes[attr] = class_decl[attr]
          }
        }
      }

      this.class_summary.set(class_name, {
        classname: class_name,
        bound,
        // search here for parent-class, search graph for children
        parents: class_decl["_extends"] ?? [],
        attributes,
        assoc_class_mat,
        assoc_class_classes,
        associations: {}
      })
      if (assoc_class_mat) {
        this._register_assoc(class_decl["_assoc"], class_name)
      }
      acc_bound.set(class_name, bound)
    }

    for (let assoc of uml.assoc) {
      this._register_assoc(assoc)
    }
  }

  model_stats() {
    const classes = Object.keys(this.uml.classes)
    const assoc_classes = classes.filter(c => this.uml.classes[c]._assoc).length
    const gen = classes.map(c => this.uml.classes[c]._extends?.length ?? 0).reduce((a, x) => a + x, 0)
    let incl_real = false, incl_string = false, incl_int = false, incl_dt = !!(Object.keys(this.uml.enums ?? {}).length || this.uml.tuples)
    for (let cl of Object.keys(this.uml.classes)) {
      for (let [attr, ty] of Object.entries(this.uml.classes[cl])) {
        if (!attr.startsWith("_") && this.attr_ref.get(`${cl}_${attr}`)) {
          switch (ty) {
            case "String":
            case "NullableString": {
              incl_string = true
              break
            }
            case "Real":
            case "NullableReal": {
              incl_real = true
              break
            }
            case "Int":
            case "NullableInt": {
              incl_int = true
              break
            }
          }
        }
      }
    }

    return {
      inv: this.assertions.length,
      inh: gen,
      assoc: this.uml.assoc.length,
      attr: [...this.attr_ref.values()].filter(n => n > 0).length,

      classes: classes.length,
      feat: {
        ac: !!assoc_classes,
        r: incl_real,
        s: incl_string,
        i: incl_int,
        dt: incl_dt,
        im: classes.some(cl => this.uml.classes[cl]._extends?.length > 1),
        oc: this.uml.assoc.some(({participants}) => participants.some(([_cl, _q, _lo, _eq, _hi, ord]) => ord)) || (this.uml?.feat?.oc ?? false),
        an: this.uml.assoc.some(({participants}) => participants.length > 2),
        cl: this.trans_cl,
      }
    }
  }

  print_model_stats() {
    // const agg_names = []
    // for (let i = 0; i < this.assertions.length; i++) {
    //   const name = this.assertion_names[i]
    //
    //   if (builtin_assertion_prefix.some(pf => name.startsWith(pf))) {
    //     agg_names.push(name)
    //   }
    // }
    // const named_assertions = this.assertion_names.filter(name => !agg_names.includes(name))
    const classes = Object.keys(this.uml.classes)
    const assoc_classes = classes.filter(c => this.uml.classes[c]._assoc)
    const inh_classes = classes.filter(c => this.uml.classes[c]._extends?.length)
    let incl_real = false, incl_string = false
    for (let cl of Object.keys(this.uml.classes)) {
      for (let [attr, ty] of Object.entries(this.uml.classes[cl])) {
        if (!attr.startsWith("_") && this.attr_ref.get(`${cl}_${attr}`)) {
          if (ty === "NullableString" || ty === "String") {
            incl_string = true
          } else if (ty === "Real" || ty === "NullableReal") {
            incl_real = true
          }
        }
      }
    }

    console.log(
      `spec ${this.uml.name ?? "unnamed"}`,
      "stats:",
      "\n",

      this.assertions.length,
      "inv",
      "\n",

      classes.length,
      "classes",
      "\n",

      this.attr_ref.size,
      "attrs",
      "\n",

      this.uml.assoc.length + assoc_classes.length,
      "assoc",
      "\n",

      inh_classes.length,
      "generalizations",
      "\n",

      assoc_classes.length,
      "assoc_class",
      "\n",

      incl_real ? "Y" : "N",
      "real",
      "\n",

      incl_string ? "Y" : "N",
      "string",
      "\n"
    )

  }

  print_fml_stats() {
    console.log(
      "filename",
      this.filename(),
    )
    console.log(
      "assertions",
      this.assertions.length,
    )

    console.log(
      "declarations",
      this.registered_builtins.size + this.registered_functions.size + this.unnamed_declarations.length
    )

    console.log(
      "sealed?",
      this.sealed
    )

    let assertion_size = 0
    for (let a of this.assertions) {
      assertion_size += Buffer.byteLength(a, "utf8") + 1
    }

    let assertion_intn_size = 0
    for (let a of this.assertion_internal) {
      assertion_intn_size += Buffer.byteLength(a, "utf8") + 1
    }

    console.log(
      "assertion size",
      Math.round(assertion_size / 1024),
      `kb (~ ${Math.round(assertion_size / 1024 / 1024)} mb)`,
    )
    console.log(
      "assertion size (internal)",
      Math.round(assertion_size / 1024),
      `kb (~ ${Math.round(assertion_size / 1024 / 1024)} mb)`,
    )

  }

  named(name, expr) {
    this.assertion_names.push(name)

    // if (this.stream) {
    //   const r = fs.writeSync(this.stream, `(assert ${expr})`)
    //   console.log(`written ${r}`)
    //   return
    // }

    if (this.options.core) {
      // if (this.options.aggregate_assertions && builtin_assertion_prefix.some(pf => name.startsWith(pf))) {
      //   if (!this.options.silent) {
      //     console.log("aggregate", name)
      //   }
      //   this.assertions.push(expr)
      // } else {
      //   this.assertions.push(`(! ${expr} :named ${name})`)
      // }
      this.assertions.push(`(! ${expr} :named ${name})`)
    } else {
      if (!this.options.silent) {
        console.log(`skip assertion name ${name}`)
      }
      this.assertions.push(expr)
    }
  }

  unnamed(expr) {
    this.named(`unnamed_assert_${this.unnamed_assertion_id}`, expr)
    this.unnamed_assertion_id += 1
  }

  internal(name, expr) {
    this.assertion_internal_names.push(name)

    // if (this.stream) {
    //   const r = fs.writeSync(this.stream, `(assert ${expr})`)
    //   console.log(`written ${r}`)
    //   return
    // }

    if (this.options.core) {
      if (this.options.aggregate_assertions) {
        this.assertion_internal.push(expr)
      } else {
        this.assertion_internal.push(`(! ${expr} :named ${name})`)
      }
    } else {
      this.assertion_internal.push(expr)
    }
  }

  assert_context(src_class, ...expr) {
    let ctx_cnt = 0
    if (this.ctx_assertion_count.has(src_class)) {
      ctx_cnt = this.ctx_assertion_count.get(src_class)
    }
    this.ctx_assertion_count.set(src_class, ctx_cnt + 1)

    for (let i = 0; i < expr.length; i++) {
      this.named(`assert_${src_class}_${ctx_cnt}_${i}`, expr[i])
    }
  }

  inheritance_constraint_multi(X, child_inter, k_c, k_x, k_y, mat_cx, mat_cy) {
    const xs = []
    for (let i = 0; i < k_x; i++) {
      // xi to C to Y = null
      // const cast_null1 = `(= ${bv(k_y, n_y)} (${id_class_cast(C, Y)} (${id_class_cast(X, C)} ${bv(i, n_x)})))`

      const cast_null1 = []

      for (let j = 0; j < k_c; j++) {
        const downcast = []
        for (let k = 0; k < k_y; k++) {
          downcast.push(id_mat_coords(mat_cy, k, j))
        }

        cast_null1.push(`(not (and ${id_mat_coords(mat_cx, i, j)} (or ${downcast.join(" ")})))`)
      }

      const cast_null2 = []

      for (let S of child_inter) {
        const k_s = this.bound_of(S)
        const mat_sx = this.v_inh_pref(S, X)

        const xs = []
        // cast_null2.push(`(= ${bv(k_s, n_s)} (${id_class_cast(X, S)} ${bv(i, n_x)}))`)
        for (let j = 0; j < k_s; j++) {
          xs.push(`(not ${id_mat_coords(mat_sx, j, i)})`)
        }
        cast_null2.push(`(and ${xs.join(" ")})`)
      }

      xs.push(`(= (and ${cast_null1.join(" ")}) (and ${cast_null2.join(" ")}))`)
    }

    return xs
  }

  inheritance_constraints() {
    const G = this.class_inheritance_graph
    const assertions = []
    for (let C of Object.keys(G)) {
      const k_c = this.bound_of(C)
      // const n_c = bvn(k_c)
      const children = G[C]
      for (let [X, Y] of each_distinct(children)) {
        const cl_X = graph_closure(G, [X])
        const cl_Y = graph_closure(G, [Y])
        const R = set_intersection(cl_X, cl_Y)


        const k_x = this.bound_of(X)
        const k_y = this.bound_of(Y)
        const mat_cx = this.v_inh_pref(X, C)
        const mat_cy = this.v_inh_pref(Y, C)

        if (R.size === 0) {
          // nand casting of C-X, C-Y


          for (let i = 0; i < k_c; i++) {
            const col_c_x = []
            const col_c_y = []
            for (let j = 0; j < k_x; j++) {
              col_c_x.push(id_mat_coords(mat_cx, j, i))
            }
            for (let j = 0; j < k_y; j++) {
              col_c_y.push(id_mat_coords(mat_cy, j, i))
            }
            assertions.push(`(not (and (> (+ ${col_c_y.map(b2i).join(" ")}) 0) (> (+ ${col_c_x.map(b2i).join(" ")}) 0)))`)
          }
        } else {
          // ∀xi : ((xi ↑ C) ↓ Y = NULL) ⇔ ∀S ∈ child(X) ∩ R : xi ↓ S = NULL
          // ∀yi : ((yi ↑ C) ↓ X = NULL) ⇔ ∀S ∈ child(Y) ∩ R : yi ↓ S = NULL
          const child_x_inter_R = set_intersection(R, G[X])
          const child_y_inter_R = set_intersection(R, G[Y])
          if (child_x_inter_R.size) {
            const xs = this.inheritance_constraint_multi(X, child_x_inter_R, k_c, k_x, k_y, mat_cx, mat_cy)
            assertions.push(...xs)
          }
          if (child_y_inter_R.size) {
            const ys = this.inheritance_constraint_multi(Y, child_y_inter_R, k_c, k_y, k_x, mat_cy, mat_cx)
            assertions.push(...ys)
          }
        }
      }
      if (assertions.length) {
        this.internal("cr_inh", `(and ${assertions.join(" ")})`)
      }

      for (let X of children) {
        const k_x = this.bound_of(X)
        // const n_x = bvn(k_x)

        const mat_pref = this.v_inh_pref(X, C)
        const [axiom_upcast, mat] = this.pb_mat_gen(mat_pref, true, k_x, k_c, X, null, 1, null)
        const [axiom_downcast] = this.pb_mat_gen(mat_pref, false, k_c, k_x, C, 0, null, 1)

        this.internal(`cr_inh_${X}_${C}`, `(and ${axiom_upcast.join(" ")})`)
        this.internal(`cr_inh_${C}_${X}`, `(and ${axiom_downcast.join(" ")})`)

        for (let v of mat) {
          this.decl_const(v, "Bool")
          // this.declarations.push(`(declare-const ${v} Bool)`)
        }

        // const upcast = id_class_cast(X, C)
        // const downcast = id_class_cast(C, X)
        // this.def_fun(upcast, `(define-fun ${upcast} ((x ${bvt(n_x)})) ${bvt(n_c)} ${accessor_up})`)
        // this.def_fun(downcast, `(define-fun ${downcast} ((x ${bvt(n_c)})) ${bvt(n_x)} ${accessor_down})`)
      }
    }
  }

  assoc_constraints(assoc) {
    const {classname, target_field, source_field, mat_pref, card, mode, source_class, is_single, is_ordered} = assoc
    const [lo, eq, hi] = card
    const k1 = this.bound_of(source_class)
    const k2 = this.bound_of(classname)
    // const n1 = bvn(k1)
    // const n2 = bvn(k2)
    // "borrow" format of mat to gen identifier
    const assoc_ident = this.v_assoc_2_pref(source_class, source_field, classname, target_field)
    switch (mode) {
      case AssocMode.Col:
      case AssocMode.Row: {
        const is_row = mode === AssocMode.Row
        const [axiom, mat] = this.pb_mat_gen(mat_pref, is_row, k1, k2, source_class, lo, eq, hi)
        // console.log(classname, is_row, k1, k2)
        // size_acc = size_accessor
        if (is_row) {
          for (let entry of mat) {
            this.decl_const(entry, `Bool`)
          }
        }

        // const acc = id_assoc_accessor(source_class, source_field)
        // const ret = is_single
        //   ? n2
        //   : k2
        // this.def_fun(acc, `(define-fun ${acc} ((x ${bvt(n1)})) ${bvt(ret)} ${accessor})`)

        this.internal(`assoc_${assoc_ident}`, `(and ${axiom.join(" ")})`)

        // if (this.options.lite) {
        //   this.named(`assoc_${assoc_ident}`, `(and ${axiom.join(" ")})`)
        // } else {
        //   const v_adj = `${assoc_ident}_adj`
        //   this.decl_const(v_adj, bvt(k1 * k2))
        //   this.named(`assoc_${assoc_ident}`, `(and ${axiom.join(" ")} (= ${v_adj} ${adj}))`)
        // }



        if (is_ordered) {
          // const size_acc = id_ord_assoc_size(source_class, source_field)
          // // this.def_fun(size_acc, `(define-fun ${size_acc} ((x ${bvt(n1)})) ${bvt(n2)} ${size_accessor})`)
          // const acc = id_ord_assoc_acc(source_class, source_field)
          // // const ufs = mk_uf_wired_k(acc, [k1, k2], bvn(k2), true)
          // // for (let uf of ufs) {
          // //   this.unnamed_declarations.push(uf)
          // // }
          //
          // for (let i = 0; i < k1; i++) {
          //   this.decl_const(`${size_acc}_${i}`, `Int`)
          //   for (let j = 0; j < k2; j++) {
          //     this.decl_const(`${acc}_${i}_${j}`, `Int`)
          //     this.decl_const(`${acc}_inv_${i}_${j}`, `Int`)
          //   }
          // }
          //
          // const ord_axiom = this.ord_assoc_axiom(k1, k2, source_class, source_field, is_row, mat_pref)
          // this.named(`ord_${assoc_ident}`, ord_axiom)

          const axiom = this.ord_mat_gen(mat_pref, is_row, k1, k2, source_class, source_field)
          this.internal(`ord_${assoc_ident}`, `(and ${axiom.join(" ")})`)
        }
        break
      }

      case AssocMode.ToAssoc: {
        // non-continuous
        // if (!this.options.lite) {
        //   const assoc_sum = this.class_summary.get(classname)
        //   const ks = assoc_sum.assoc_class_classes.map(it => this.bound_of(it))
        //   const ksi = assoc_sum.assoc_class_classes.indexOf(source_class)
        //   const br = []
        //   const conj = []
        //   const acc = id_assoc_accessor(source_class, source_field)
        //   for (let i = 0; i < k1; i++) {
        //     const bool_vec = []
        //     for (let j = 0; j < k2; j++) {
        //       const resolved = idx_decompose(j, ks)
        //       if (resolved[ksi] === i) {
        //         bool_vec.push(id_tbl_coords(assoc_sum.assoc_class_mat, resolved))
        //       } else {
        //         bool_vec.push("false")
        //       }
        //     }
        //     const id = `${acc}_${i}`
        //     this.decl_const(id, bvt(k2))
        //     br.push([`(= x ${bv(i, n1)})`, id])
        //     conj.push(`(= ${id} (concat ${bool_vec.reverse().map(it => `(ite ${it} #b1 #b0)`).join(" ")}))`)
        //   }
        //   const body = mk_ite(br, null)
        //   this.def_fun(acc, `(define-fun ${acc} ((x ${bvt(n1)})) ${bvt(k2)} ${body})`)
        //   this.internal(`to_assoc_${assoc_ident}`, `(and ${conj.join(" ")})`)
        // }
        break
      }
      case AssocMode.FromAssoc: {
        // if (!this.options.lite) {
        //   const br = []
        //   const assoc_sum = this.class_summary.get(source_class)
        //   const ks = assoc_sum.assoc_class_classes.map(it => this.bound_of(it))
        //   const ksi = assoc_sum.assoc_class_classes.indexOf(classname)
        //   const m = new Map()
        //   for (let i = 0; i < k1; i++) {
        //     const resolved = idx_decompose(i, ks)
        //     const j = resolved[ksi]
        //     if (m.has(j)) {
        //       m.get(j).push(i)
        //     } else {
        //       m.set(j, [i])
        //     }
        //   }
        //
        //   for (let [j, is] of m) {
        //     br.push([`(or ${is.map(i => `(= x ${bv(i, n1)})`).join(" ")})`, bv(j, n2)])
        //   }
        //
        //   const acc = id_assoc_accessor(source_class, source_field)
        //   const body = mk_ite(br, null)
        //   this.def_fun(acc, `(define-fun ${acc} ((x ${bvt(n1)})) ${bvt(n2)} ${body})`)
        // }
        break
      }
    }
  }

  // n_ary_sum(mat_pref, mode, src_bound, tgt_bound) {
  //   // sum_src_tgt
  //   const xs = []
  //   for (let i = 0; i < src_bound; i++) {
  //     const sum = []
  //     for (let j = 0; j < tgt_bound; j++) {
  //       let id
  //       switch (mode) {
  //         case AssocMode.Row: {
  //           id = id_mat_coords(mat_pref, i, j)
  //           break
  //         }
  //         case AssocMode.Col: {
  //           id = id_mat_coords(mat_pref, j, i)
  //           break
  //         }
  //       }
  //
  //       sum.push(id)
  //     }
  //     const expr = `(distinct ${pb_sum(sum)} 0)`
  //     xs.push(expr)
  //   }
  //
  //   return pb_sum(xs)
  // }

  n_ary_assoc_constraint(participants) {
    const axiom = []
    const assoc_pref = this.v_assoc_n_pref(participants)
    const classes = participants.map(([c]) => c)
    const bounds = classes.map(it => this.bound_of(it))
    const K = prod(bounds)
    const tbl = []
    for (let i = 0; i < K; i++) {
      const cmp = idx_decompose(i, bounds)
      const id = id_tbl_coords(assoc_pref, cmp)
      this.decl_const(id, `Bool`)
      tbl.push([id, cmp])
    }

    // const pl = participants.length
    //
    // for (let i = 0; i < pl; i++) {
    //   const [sc, sf] = participants[i]
    //   const ks = this.bound_of(sc)
    //   const sums = []
    //   for (let j = 0; j < pl; j++) {
    //     if (j !== i) {
    //       const [tc, tf] = participants[j]
    //       const kt = this.bound_of(tc)
    //       const m = j < i ? AssocMode.Col : AssocMode.Row
    //       const mat = j < i
    //         ? id_assoc_mat_pref(tc, sf, sc, tf)
    //         : id_assoc_mat_pref(sc, tf, tc, sf)
    //       const sum_t = this.n_ary_sum(mat, m, ks, kt)
    //       sums.push(sum_t)
    //     }
    //   }
    //
    //   axiom.push(`(= ${sums.join(" ")})`)
    // }

    const pi = participants.map((_, i) => i)
    for (let [ei, ej] of each_distinct(pi)) {
      const [c1, f1] = participants[ei]
      const [c2, f2] = participants[ej]
      const k1 = this.bound_of(c1)
      const k2 = this.bound_of(c2)
      const m = this.v_assoc_2_pref(c1, f2, c2, f1)

      for (let i = 0; i < k1; i++) {
        for (let j = 0; j < k2; j++) {
          const disj = []
          const coords = id_mat_coords(m, i, j)
          for (let [id, cmp] of tbl) {
            if (cmp[ei] === i && cmp[ej] === j) {
              disj.push(id)
            }
          }
          axiom.push(`(= ${coords} (or ${disj.join(" ")}))`)
        }
      }

      // for (let [id, cmp] of tbl) {
      //   if (cmp[ei])
      // }
    }

    // for (let [e_i, e_j] of each_distinct(pi)) {
    //   const [c1, f1] = participants[e_i]
    //   const [c2, f2] = participants[e_j]
    //   const k1 = this.bound_of(c1)
    //   const k2 = this.bound_of(c2)
    //   if (e_j !== e_i + 1) {
    //     // indirect matrix derivation
    //     const ri = e_j - 1
    //     const [cr, fr] = participants[ri]
    //
    //     // c1 is row of c1-cr
    //     // c2 is col of cr-c2
    //     // c1 is row of c1-c2
    //     const m1 = id_assoc_mat_pref(c1, fr, cr, f1)
    //     const m2 = id_assoc_mat_pref(cr, f2, c2, fr)
    //     const mr = id_assoc_mat_pref(c1, f2, c2, f1)
    //
    //     const kr = this.bound_of(cr) // eliminated in resulting mat
    //
    //     // indirect mat
    //     const dot = pb_dot_prod(m1, k1, m2, k2, mr, kr)
    //     axiom.push(dot)
    //   } else {
    //     // direct matrix derivation
    //
    //     for (let i = 0; i < k1; i++) {
    //       for (let j = 0; j < k2; j++) {
    //
    //       }
    //     }
    //   }
    // }

    if (axiom.length) {
      this.internal(`n_assoc_${participants.map(([c, f]) => `${c}_${f}`).join("_")}`, `(and ${axiom.join("\n")})`)
    }
  }

  class_constraints(classname) {
    const sum = this.class_summary.get(classname)
    const k = sum.bound
    // const n = bvn(k)
    const vec = []
    // a boolean vector of is-null of instances
    for (let i = 0; i < k; i++) {
      if (sum.assoc_class_mat) {
        const ks = sum.assoc_class_classes.map(cl => this.bound_of(cl))
        const resolved = idx_decompose(i, ks)
        vec.push(`${sum.assoc_class_mat}_${resolved.join("_")}`)
      } else if (!this.options.dense_instance) {
        const id = this.v_class_inst(classname, i)
        this.decl_const(id, "Bool")
        vec.push(id)
      }
    }

    if (sum.assoc_class_mat || !this.options.dense_instance) {
      const size_nat = this.v_class_size(classname)
      this.decl_const(size_nat, "Int")
      // at least one is active
      this.internal(`class_inst_${classname}`, `(and (= ${size_nat} (+ ${vec.map(b2i).join(" ")})) (or ${vec.join(" ")}))`)
    } else if (!this.options.pseudo_size) {
      const size_nat = this.v_class_size(classname)
      this.decl_const(size_nat, "Int")
      this.internal(`class_inst_${classname}`, `(> ${size_nat} 0)`)
    } else {
      const xs = []
      for (let i = 0; i < k; i++) {
        const v = this.v_class_size_pseudo(classname, i + 1)
        this.decl_const(v, `Bool`)
        xs.push(v)
      }
      this.internal(`class_inst_${classname}`, `(= 1 (+ ${xs.map(b2i).join(" ")}))`)
    }

    for (let [attr, ty] of Object.entries(sum.attributes)) {
      if (!this.attr_ref.get(`${classname}_${attr}`)) {
        if (!this.options.silent) {
          console.log(`skip unused attribute ${classname}.${attr}`)
        }
        continue
      }
      // const br = []
      const enum_int = this.options.enum_int && this.uml.enums?.[ty]
      if (enum_int) {
        const conj = []
        const hi = this.uml.enums[ty].length
        for (let i = 0; i < k; i++) {
          const v = this.v_attr(classname, attr, i) // id_class_attr(classname, attr, i)
          conj.push(`(and (>= ${v} 0) (< ${v} ${hi}))`)
        }
        this.internal(`enum_bound_${ty}`, `(and ${conj.join(" ")})`)
      }
      for (let i = 0; i < k; i++) {
        const v = this.v_attr(classname, attr, i) // id_class_attr(classname, attr, i)
        if (enum_int) {
          this.decl_const(v, `Int`)
        } else {
          const ident = ["Int", "Real", "String", "Bool"].includes(ty)
            ? ty
            : this.ty(ty)

          this.decl_const(v, ident)
        }
        // br.push([`(= x ${bv(i, n)})`, v])
      }

      // const accessor = id_class_attr_accessor(classname, attr)
      // const body = mk_ite(br, null)
      // this.def_fun(accessor, `(define-fun ${accessor} ((x ${bvt(n)})) ${ty} ${body})`)
    }

    for (let assoc of Object.values(sum.associations)) {
      this.assoc_constraints(assoc)
    }
  }

  bound_of(classname) {
    const sum = this.class_summary.get(classname)
    return sum.bound
  }

  bounds_of(classnames) {
    return classnames.reduce((acc, id) => acc * this.bound_of(id), 1)
  }

  bounds_assoc(associations) {
    // let r = 1
    // for (let assoc of associations) {
    //   switch (assoc.mode) {
    //     case AssocMode.ToAssoc:
    //     case AssocMode.Col:
    //     case AssocMode.Row: {
    //       r *= this.bound_of(assoc.classname)
    //       break
    //     }
    //     // hard to simplify
    //     // case AssocMode.ToAssoc: {
    //     //   const sum = this.class_summary.get(assoc.classname)
    //     //   // todo: multiple fields of same class ...
    //     //   const excl = sum.assoc_class_classes.filter(cl => cl !== assoc.source_class)
    //     //   r *= this.bounds_of(excl)
    //     //   break
    //     // }
    //     case AssocMode.FromAssoc: {
    //       // u.a
    //       // inv u : |self.a->select(...)| = 1
    //       // inv x : |self.y.u.a| = k_y * k_u if y notin R_u, k_y * k_a if R_u = {y, a} = |self.y.a|
    //       // thus, ignored
    //       break
    //     }
    //   }
    // }

    return this.bounds_of(associations.map(it => it.classname))
  }

  bounds_path(src_class, path) {
    const assoc = this.path_to_associations(src_class, path)
    return this.bounds_assoc(assoc) // this.bounds_of(assoc.map(it => it.classname))
  }

  bound_path_final(src_class, path) {
    const assoc = this.path_to_associations(src_class, path)
    return this.bound_of(assoc[assoc.length - 1].classname)
  }

  // n(classname) {
  //   return bvn(this.bound_of(classname))
  // }

  in_dom(classname, i) {
    const sum = this.class_summary.get(classname)
    if (sum.assoc_class_mat) {
      const classes = sum.assoc_class_classes
      const bounds = classes.map(c => this.bound_of(c))
      const idx = idx_decompose(i, bounds)
      return `${sum.assoc_class_mat}_${idx.join("_")}`
    } else if (this.options.dense_instance) {
      if (this.options.pseudo_size) {
        const k = sum.bound
        const disj = []
        for (let j = 1; j < k + 1; j++) {
          const id = this.v_class_size_pseudo(classname, j)
          if (i < j) {
            // const conj = []
            // for (let l = 1; l < k + 1; l++) {
            //   conj.push(l === j ? id : `(not ${id_dom_size_pseudo(classname, l)})`)
            // }
            // disj.push(`(and ${conj.join(" ")} )`)
            disj.push(id)
          }
        }

        return `(or ${disj.join(" ")})`
      } else {
        return `(< ${i} ${this.v_class_size(classname)})`
      }
    } else {
      // such instance is active
      return this.v_class_inst(classname, i)
    }

    // return `(bvult ${bv(i, this.n(classname))} ${id_dom_size(classname)})`
  }

  dom_sized(classname, size) {
    if (this.options.pseudo_size) {
      return this.v_class_size_pseudo(classname, size)
    } else {
      return `(= ${this.v_class_size(classname)} ${size})`
    }
  }

  in_assoc_set(assoc, src_idx, tgt_idx) {
    const {mat_pref, mode, classname, source_class} = assoc

    switch (mode) {
      case AssocMode.Row : return id_mat_coords(mat_pref, src_idx, tgt_idx)
      case AssocMode.Col : return id_mat_coords(mat_pref, tgt_idx, src_idx)
      case AssocMode.ToAssoc: {
        // src: class
        // tgt: assoc class

        const assoc_class = this.class_summary.get(classname)
        const related_classes = assoc_class.assoc_class_classes
        const ks = related_classes.map(c => this.bound_of(c))
        const ksi = related_classes.indexOf(source_class)

        const resolved = idx_decompose(tgt_idx, ks)
        if (resolved[ksi] === src_idx) {
          return id_tbl_coords(assoc_class.assoc_class_mat, resolved)
        } else {
          return `false`
          // throw new Error("unreachable assoc coordinate")
        }

        // const is = iter_composite_index(prev_i, ks, ksi)

        // const sum = this.class_summary.get(classname)
        // const ks = sum.assoc_class_classes.map(c => this.bound_of(c))
        // const tgt_normalized = of_composite_index(tgt_idx, ks)
        // get i' = index of source_class in ptc of association class
        // if tgt_normalized[i'] = src_idx then return corresponding entry of table
        // otherwise return null (out of range)

        // if (is_single) {
        //   return `(= (${id_assoc_accessor(source_class, source_field)} ${src_idx}) ${tgt_idx})`
        // }
        // return `(= #b1 ((_ extract ${tgt_idx} ${tgt_idx}) (${id_assoc_accessor(source_class, source_field)} ${src_idx})))`
      }
      case AssocMode.FromAssoc: {
        // src: assoc class
        // tgt: class

        const assoc_class = this.class_summary.get(source_class)
        const related_classes = assoc_class.assoc_class_classes
        const ks = related_classes.map(c => this.bound_of(c))
        const ksi = related_classes.indexOf(classname)

        const resolved = idx_decompose(src_idx, ks)
        if (resolved[ksi] === tgt_idx) {
          return id_tbl_coords(assoc_class.assoc_class_mat, resolved)
        } else {
          return `false`
          // throw new Error("unreachable assoc coords")
        }

        // return `(= (${id_assoc_accessor(source_class, source_field)} ${src_idx}) ${tgt_idx})`
      }
    }
  }

  with_instances(is_forall, src_class, f) {
    const sum = this.class_summary.get(src_class)
    const xs = []
    for (let i = 0; i < sum.bound; i++) {
      const body = f(i)

      if (body) {
        const expr = is_forall
          ? `(=> ${this.in_dom(src_class, i)} ${body})`
          : `(and ${this.in_dom(src_class, i)} ${body})`

        xs.push(expr)
      }
    }

    return `(${is_forall ? `and` : `or`} ${xs.join("\n")})`
  }

  forall_instances(src_class, f) {
    return this.with_instances(true, src_class, f)
  }

  exists_instances(src_class, f) {
    return this.with_instances(false, src_class, f)
  }

  instances(src_class) {
    const sum = this.class_summary.get(src_class)
    const xs = []
    for (let i = 0; i < sum.bound; i++) {
      xs.push(this.in_dom(src_class, i))
    }
    return xs
  }

  assoc_filter_pb(xs, target_class, f) {
    const k = this.bound_of(target_class)
    const ys = []
    for (let i = 0; i < xs.length; i++) {
      const j = i % k
      ys.push(`(and ${xs[i]} ${f(j)})`)
    }

    return ys
  }

  iterate_navigate_aux(
    src_class,
    src_i,
    path,
    f,
    // acc_var = [],
    // acc_assoc = [],
    // acc_conj = []
  ) {
    const assoc = this.path_to_associations(src_class, path)
    const ks = assoc.map(it => this.bound_of(it.classname))
    const K = prod(ks)
    const xs = []
    for (let i = 0; i < K; i++) {
      const cmp = idx_decompose(i, ks)
      const in_dom = []
      let s = src_i
      for (let j = 0; j < cmp.length; j++) {
        in_dom.push(this.in_assoc_set(assoc[j], s, cmp[j]))
        s = cmp[j]
      }
      // const in_dom = [this.cache_assoc(src_i, assoc, cmp)]

      const body = f([src_i, ...cmp], assoc, in_dom)
      xs.push(body)
    }

    return xs
  }

  iterate_navigate(src_class, src_i, path, f, compose) {
    const xs = this.iterate_navigate_aux(
      src_class,
      src_i,
      path,
      f,
    )
    return compose(xs)
  }

  path_to_associations(src_c, p) {
    let curr = this.class_summary.get(src_c)
    const assoc_xs = []
    for (let field of p) {
      const a = curr.associations[field]
      assoc_xs.push(a)
      curr = this.class_summary.get(a.classname)
    }

    return assoc_xs
  }

  forall_navigate(src_class, src_i, path, f) {
    return this.iterate_navigate(src_class, src_i, path, (qvs, q_assoc, conj) => {
      // const [idx, conj] = this.assoc_compose(src_i, qvs, q_assoc, pre_filter)
      const idx = this.relational_index(qvs, q_assoc)
      return `(=> (and ${conj.join(" ")}) ${f(qvs, q_assoc, idx)})`
    }, xs => `(and ${xs.join("\n")})`)
  }

  exists_navigate(src_class, src_i, path, f) {
    return this.iterate_navigate(src_class, src_i, path, (qvs, q_assoc, conj) => {
      const idx = this.relational_index(qvs, q_assoc)
      return `(and ${conj.join(" ")} ${f(qvs, q_assoc, idx)})`
    }, xs => `(or ${xs.join("\n")})`)
  }

  relational_index(qvs, p_assoc) {
    // let target_idx = src_i // * this.bound_of(p_assoc[0].classname) // ik
    // for (let assoc of p_assoc) {
    //   target_idx *= this.bound_of(assoc.classname)
    // }
    // const ks = p_assoc.map(assoc => assoc.mode === AssocMode.FromAssoc
    //   ? 1
    //   : this.bound_of(assoc.classname)
    // )
    const ks = p_assoc.map(assoc => this.bound_of(assoc.classname))
    return idx_compose(qvs.slice(1), ks)

    // let result = 1
    //
    // for (let i = 1; i < qvs.length; i++) {
    //   // qvs[0] is src_idx which separated into variables (always ignore)
    //
    //   // |p_assoc| = |qvs| - 1
    //   const assoc_k = p_assoc.slice(i).reduce((acc, k) => acc * k, 1)
    //   result += qvs[i] * assoc_k
    // }
    //
    // return result

    // for (let i = 0; i < qvs.length; i++) {
    //   const idx = qvs[i]
    //   const next_assoc = p_assoc[i + 1]
    //   if (next_assoc) {
    //     let x = idx
    //     for (let j = i+1; j < p_assoc.length; j++) {
    //       x *= this.bound_of(p_assoc[j].classname)
    //     }
    //     target_idx += x // idx * this.bound_of(next_assoc.classname)
    //   } else {
    //     // last slot
    //     target_idx += idx
    //   }
    // }
    //
    // return target_idx
  }

  assoc_path_size_pb(src_class, src_i, path, filter = null) {
    return this.iterate_navigate(src_class, src_i, path, (_1, _2, conj) => {
      return `(and ${conj.join(" ")} ${filter ? filter(_1, _2) : ""})`
    }, xs => `(+ ${xs.map(b2i).join(" ")})`)
  }

  assoc_vec(src_class, src_i, path) {
    return this.iterate_navigate(src_class, src_i, path, (_1, _2, c) => `(and ${c.join(" ")})`, x => x)
  }

  assoc_path_intersection(src_class, src_i, p1, p2) {
    const v1 = this.assoc_vec(src_class, src_i, p1)
    const v2 = this.assoc_vec(src_class, src_i, p2)
    const k = this.bound_path_final(src_class, p1)

    if (p1.length === 1 && p2.length === 1) {
      // set intersection
      const xs = []

      for (let i = 0; i < k; i++) {
        xs.push(`(and ${v1[i]} ${v2[i]})`)
      }

      return xs
    }


    const ak1 = this.bounds_path(src_class, p1)
    const ak2 = this.bounds_path(src_class, p2)
    const a1 = Math.floor(ak1 / k)
    const a2 = Math.floor(ak2 / k)

    const akm = Math.max(ak1, ak2)
    const am = Math.max(a1, a2)
    const xs = []
    const sl1 = []
    const sl2 = []

    for (let i = 0; i < k; i++) {
      for (let j = 0; j < am; j++) {
        if (!sl1[i]) {
          sl1[i] = []
        }
        if (!sl2[i]) {
          sl2[i] = []
        }
        sl1[i].push(v1[j * k + i] ?? `false`)
        sl2[i].push(v2[j * k + i] ?? `false`)
      }
    }

    for (let i = 0; i < akm; i++) {
      const i1 = Math.floor(i / am)
      const i2 = i % am
      const s1 = sl1[i1]
      const s2 = sl2[i1]
      const t = s1[i2]
      const e = s2[i2]
      xs.push(`(ite (< (+ ${s1.join(" ")}) (+ ${s2.join(" ")})) ${t} ${e})`)
    }

    return xs

    // assume k1 = k2, then (a = 2)
    // 011 101
    // 101 100

    // for every object: get min
    // then re-distribute

    // o0 = 01 min 11 = 01
    // o1 = 10 min 00 = 00
    // o2 = 11 min 10 = 10
    // r = 001 100

    // 100 011
    // 011 100

    // o0 = 10 min 01 = 01
    // o1 = 01 min 10 = 01
    // o2 = 01 min 10 = 01
    // r = 000 111

    // x'_i = cons_{0 <= j < a} x[jk + i]
    // cons_{0 <= i < ak} min_b(x'_{i / a}, y'_{i / a})[i mod a]
  }

  assoc_path_union(src_class, src_i, p1, p2) {
    const v1 = this.assoc_vec(src_class, src_i, p1)
    const v2 = this.assoc_vec(src_class, src_i, p2)
    if (p1.length === 1 && p2.length === 1) {
      const xs = []
      for (let i = 0; i < v1.length; i++) {
        xs.push(`(or ${v1[i]} ${v2[i]})`)
      }
      return xs
    }
    return v1.concat(v2)
  }

  assoc_path_includes(src_class, src_i, path, target_path) {
    // elements of path includes all elements of target
    // target is subset of path

    if (!target_path?.length) {
      // includes self
      const last_field = path[path.length - 1]
      if (path.length === 1) {
        // diagonal of matrix is 1
        const assoc = this.class_summary.get(src_class).associations[last_field]
        const conj = [
          this.in_assoc_set(assoc, src_i, src_i)
        ]
        // if (src_filter) {
        //   conj.push(src_filter([src_i], [assoc]))
        // }
        return `(and ${conj.join(" ")})`
      }
      return this.iterate_navigate(src_class, src_i, path, (tvs, t_assoc, conj2) => {
        // const [_, conj2] = this.assoc_compose(src_i, tvs, t_assoc, null)
        const cond = []
        const fin_assoc = this.class_summary.get(t_assoc[t_assoc.length - 1].classname).associations[last_field]
        // if (src_filter) {
        //   // src_i == target index
        //   cond.push(src_filter([src_i], [fin_assoc]))
        // }
        cond.push(this.in_assoc_set(fin_assoc, tvs[tvs.length - 1], src_i))

        return `(and ${conj2.join(" ")} ${cond.join(" ")})`
      }, xs => `(and ${xs.join(" ")})`)
    }

    const v = this.iterate_navigate(src_class, src_i, path, (qvs, _, conj) => [qvs, `(and ${conj.join(" ")})`], x => x)

    return this.iterate_navigate(src_class, src_i, target_path, (qvs, _1, conj) => {
      // and src[i] = 1
      const i = lst(qvs)
      const disj = []

      for (let [vs, e] of v) {
        if (lst(vs) === i) {
          disj.push(e)
        }
      }

      return `(and ${conj.join(" ")} (or ${disj.join(" ")}))`
    }, xs => `(or ${xs.join(" ")})`)

    // return this.iterate_navigate(src_class, src_i, target_path, (qvs, q_assoc, _conj) => {
    //   // target index invariant to total order
    //   const tg_idx = qvs[qvs.length - 1]
    //   const last_field = path[path.length - 1]
    //   const conj = [..._conj]
    //   if (path.length === 1) {
    //     const assoc = this.class_summary.get(src_class).associations[last_field]
    //     const is_in = this.in_assoc_set(assoc, src_i, tg_idx)
    //     if (src_filter) {
    //       conj.push(src_filter([tg_idx], [assoc]))
    //     }
    //     conj.push(is_in)
    //   } else {
    //     const path_sliced = path.slice(0, path.length - 1)
    //     const cond = this.iterate_navigate(src_class, src_i, path_sliced, (tvs, t_assoc, conj2) => {
    //       // const [_, conj2] = this.assoc_compose(src_i, tvs, t_assoc, null)
    //       const cond = []
    //       const fin_assoc = this.class_summary.get(t_assoc[t_assoc.length - 1].classname).associations[last_field]
    //       if (src_filter) {
    //         cond.push(src_filter([tg_idx], [fin_assoc]))
    //       }
    //       cond.push(this.in_assoc_set(fin_assoc, tvs[tvs.length - 1], tg_idx))
    //
    //       return `(and ${conj2.join(" ")} ${cond.join(" ")})`
    //     }, ys => `(and ${ys.join(" ")})`)
    //
    //     conj.push(cond)
    //   }
    //   return `(and ${conj.join("\n")})`
    //
    // }, xs => `(or ${xs.join(" ")})`)
  }

  assoc_path_includes_all(src_class, src_i, path, target_path) {
    return this.forall_navigate(src_class, src_i, target_path, (vs) => {
      const v = this.iterate_navigate(src_class, src_i, path, (qvs, _, conj) => [qvs, `(and ${conj.join(" ")})`], x => x)

      const i = lst(vs)
      const disj = []

      for (let [vs, e] of v) {
        if (lst(vs) === i) {
          disj.push(e)
        }
      }

      return `(or ${disj.join(" ")})`
    })

    // return this.iterate_navigate(src_class, src_i, target_path, (qvs, q_assoc, conj) => {
    //   // const [idx, conj] = this.assoc_compose(src_i, qvs, q_assoc, target_filter)
    //   let then
    //   const tg_idx = qvs[qvs.length - 1]
    //   const last_field = path[path.length - 1]
    //   if (path.length === 1) {
    //     const assoc = this.class_summary.get(src_class).associations[last_field]
    //     const is_in = this.in_assoc_set(assoc, src_i, tg_idx)
    //     const t = []
    //     t.push(is_in)
    //     then = `(and ${t.join(" ")})`
    //   } else {
    //     const path_sliced = path.slice(0, path.length - 1)
    //     then = this.iterate_navigate(src_class, src_i, path_sliced, (tvs, t_assoc, conj2) => {
    //       // const [_, conj2] = this.assoc_compose(src_i, tvs, t_assoc, null)
    //
    //       const cond = []
    //       const fin_assoc = this.class_summary.get(t_assoc[t_assoc.length - 1].classname).associations[last_field]
    //       cond.push(this.in_assoc_set(fin_assoc, tvs[tvs.length - 1], tg_idx))
    //
    //       return `(and ${conj2.join(" ")} ${cond.join(" ")})`
    //     }, ys => `(or ${ys.join(" ")})`)
    //   }
    //   // if in b then in a
    //   return `(=> ${conj.join(" ")} ${then})`
    // }, xs => `(and ${xs.join(" ")})`)
  }

  assoc_each_distinct(src_class, src_i, path, f_distinct) {
    if (!path?.length) {
      const k = this.bound_of(src_class)
      const xs = []
      for (let i = 0; i < k; i++) {
        if (i !== src_i) {
          xs.push(`(=> ${this.in_dom(src_class, i)} ${f_distinct(src_i, i)})`)
        }
      }

      return `(and ${xs.join("\n")})`
    }

    let id_p = 0

    const xs = this.iterate_navigate_aux(src_class, src_i, path, (...a) => a)
    const ys = []
    const vs = []
    const us = []

    // let decl = `(let (`

    for (let [q, p, c] of xs) {
      const e = lst(q)
      const g = `(and ${c.join(" ")})`
      const v = `p${id_p}`
      // decl += `(${v} ${g})`
      ys.push([v, e])
      vs.push(`(${v} ${g})`)
      id_p += 1
    }


    // decl += ") (and "

    for (let i = 0; i < ys.length; i++) {
      for (let j = i+1; j < ys.length; j++) {
        // decompose i, j
        // apply f
        const [v1, e1] = ys[i]
        const [v2, e2] = ys[j]
        // const expr = `(=> (and ${v1} ${v2}) ${f_distinct(e1, e2)})`
        // decl += expr
        // console.log(v1, f_distinct(e1, e2))
        us.push(`(=> (and ${v1} ${v2}) ${f_distinct(e1, e2)})`)
      }
    }


    // decl += "))"

    return `(let (${vs.join("")}) (and ${us.join("")}))`


    // return this.iterate_navigate(src_class, src_i, path, (q, p, c1) => {
    //   const cmp = this.relational_index(q, p)
    //   const inner = this.iterate_navigate(src_class, src_i, path, (q2, p2, c2) => {
    //     const cmp2 = this.relational_index(q2, p2)
    //     if (cmp !== cmp2) {
    //       return `(=> (and ${c2.join(" ")}) ${f_distinct(lst(q), lst(q2))})`
    //     } else {
    //       return null
    //     }
    //   }, ys => `(and ${ys.filter(it => it).join("\n")})`)
    //
    //   return `(=> (and ${c1.join(" ")}) ${inner})`
    // }, xs => `(and ${xs.join("\n")})`)
  }

  assoc_closure_pb_iter(src_class, expr_prev, mat_selector) {
    // expr_prev: []
    // mat_builder: fn
    const k = this.bound_of(src_class)
    const resulting = []
    for (let i = 0; i < k; i++) {
      const disj = []
      const p = expr_prev[i]
      for (let j = 0; j < k; j++) {
        // x[j] && M[j, i]
        const m = mat_selector(j, i)
        disj.push(`(and ${expr_prev[j]} ${m})`)
      }
      const expr = `(or ${p} ${disj.join(" ")})`
      resulting.push(expr)
    }

    return resulting
  }

  assoc_closure_pb(src_class, expr_x0, mat_selector, id) {
    this.trans_cl = true
    // src_i only for identifier
    let i = 0;
    const k = this.bound_of(src_class)
    let x_i = expr_x0
    const conj = []
    while (i < k - 1) {
      const iter = this.assoc_closure_pb_iter(src_class, x_i, mat_selector)
      const vs = []
      for (let j = 0; j < iter.length; j++) {
        const v = `${id}_${i}_${j}`
        this.decl_const(v, `Bool`)
        conj.push(`(= ${v} ${iter[j]})`)
        vs.push(v)
      }
      x_i = vs
      i += 1
    }
    this.internal(`closure_${id}`, `(and ${conj.join("\n")})`)
    return x_i
  }

  assoc_coords(src_class, field, i, j) {
    const sum = this.class_summary.get(src_class)
    const assoc = sum.associations[field]
    return this.in_assoc_set(assoc, i, j)
    // const mat = assoc.mat_pref
    // switch (assoc.mode) {
    //   case AssocMode.Row: return id_mat_coords(mat, i, j)
    //   case AssocMode.Col: return id_mat_coords(mat, j, i)
    //   default: throw new Error("invalid assoc mode")
    // }
  }

  ord_assoc_at(src_class, src_i, field, index, f) {
    const sum = this.class_summary.get(src_class)
    const assoc = sum.associations[field]
    const k = this.bound_of(assoc.classname)
    const disj = []
    for (let i = 0; i < k; i++) {
      const ident = this.v_assoc_ord_index(assoc.mat_pref, assoc.mode === AssocMode.Row, src_i, index, i) // id_ord_mat_coords(assoc.mat_pref, field, src_i, index, i)
      disj.push(`(and ${ident} ${f(i)})`)
    }

    return `(or ${disj.join(" ")})`
  }

  ord_assoc_index_of(src_class, src_i, field, target_index) {
    const sum = this.class_summary.get(src_class)
    const assoc = sum.associations[field]
    return this.v_assoc_ord_inv(assoc.mat_pref, assoc.mode === AssocMode.Row, src_i, target_index)

    // const k = this.bound_of(assoc.classname)
    // const br = []
    // for (let i = 0; i < k; i++) {
    //   const ident = id_ord_mat_coords(assoc.mat_pref, field, src_i, i, target_index)
    //   br.push([ident, i])
    // }
    // return mk_ite(br, null)
  }

  exists_cast(src_class, src_i, target_class, f = null) {
    let c, p;
    if (this.class_inheritance_graph[src_class]?.includes(target_class) || this.class_inheritance_indirect[src_class]?.includes(target_class)) {
      c = target_class
      p = src_class
    } else if (this.class_inheritance_graph[target_class]?.includes(src_class) || this.class_inheritance_indirect[target_class]?.includes(src_class)) {
      c = src_class
      p = target_class
    } else {
      throw new Error("Invalid inheritance relation")
    }

    const mat = this.v_inh_pref(c, p)
    const k = this.bound_of(target_class)
    const xs = []
    for (let i = 0; i < k; i++) {
      const body = f ? f(i) : ""
      if (c === src_class) {
        xs.push(`(and ${id_mat_coords(mat, src_i, i)} ${body})`)
      } else {
        xs.push(`(and ${id_mat_coords(mat, i, src_i)} ${body})`)
      }
    }

    return `(or ${xs.join(" ")})`
  }

  decl_indirect_cast(child, intermediate, parent) {
    // let c, i, p;
    // if (this.class_inheritance_graph[src_class]?.includes(intermediate_class)) {
    //   c = intermediate_class
    //   i = src_class
    // } else if (this.class_inheritance_graph[intermediate_class]?.includes(src_class)) {
    //   c = src_class
    //   i = intermediate_class
    // } else {
    //   throw new Error("Invalid inheritance relation")
    // }

    const m1 = this.v_inh_pref(child, intermediate)
    const m2 = this.v_inh_pref(intermediate, parent)
    const mr = this.v_inh_pref(child, parent)

    const k1 = this.bound_of(child)
    const k2 = this.bound_of(parent)
    const kr = this.bound_of(intermediate)

    for (let i = 0; i < k1; i++) {
      // const row = rows[i]
      for (let j = 0; j < k2; j++) {
        // const col = cols[j]
        const id = id_mat_coords(mr, i, j)
        // axiom.push(`(= ${id} (distinct ${pb_sum(pb_and(row, col))} 0))`)
        this.decl_const(id, `Bool`)
      }
    }

    const xs = pb_dot_prod(m1, k1, m2, k2, mr, kr)
    this.internal(`inh_indir_${child}_${intermediate}_${parent}`, xs)
    if (this.class_inheritance_indirect[parent]) {
      this.class_inheritance_indirect[parent].push(child)
    } else {
      this.class_inheritance_indirect[parent] = [child]
    }
  }

  decl_pb(src_class, id) {
    const k = this.bound_of(src_class)
    const xs = []
    for (let i = 0; i < k; i++) {
      const ident = `${id}_${i}`
      this.decl_const(ident, `Bool`)
      xs.push(ident)
    }

    return xs
  }

  decl_pb_cond(xs, id, pre = null) {
    const v = []
    const axiom = []
    for (let i = 0; i < xs.length; i++) {
      const ident = `${id}_${i}`
      this.decl_const(ident, `Bool`)
      v.push(ident)
      const e = `(= ${ident} ${xs[i]})`
      axiom.push(pre ? `(ite ${pre} ${e} (not ${ident}))` : e)
    }
    this.internal(`pb_${id}`, `(and ${axiom.join(" ")})`)
    return v
  }

  app(call, ...xs) {
    // todo: intercept calls here
    // console.log("app", xs)
    return `(${call} ${xs.join(" ")})`
  }

  attr(classname, field, i) {
    const sum = this.class_summary.get(classname)
    if (!sum.attributes[field]) {
      throw new Error(`No attribute: ${classname}.${field}`)
    }

    const key = `${classname}_${field}`
    this.attr_ref.set(key, (this.attr_ref.get(key) ?? 0) + 1)
    return this.v_attr(classname, field, i)

    // if (sum.associations[field]) {
    //   return `(${id_assoc_accessor(classname, field)} ${bv(i, this.n(classname))})`
    // } else {
    //
    // }
  }

  gen_data_types() {
    for (let ty of this.registered_builtin_sorts.values()) {
      this.unnamed_declarations.push(ty)
    }

    if (this.uml.enums) {
      if (this.options.enum_int) {
        const axiom = []
        for (let [key, vs] of Object.entries(this.uml.enums)) {
          for (let i = 0; i < vs.length; i++) {
            const v = vs[i]
            const f = this.enum(v)
            this.decl_const(f, "Int")
            axiom.push(`(= ${f} ${i})`)
            // this.named(`enum_${key}_${v}`)
          }
        }
        this.internal(`enum_int_table`, `(and ${axiom.join("\n")})`)
      } else {
        for (let [key, vs] of Object.entries(this.uml.enums)) {
          this.unnamed_declarations.push(`(declare-datatypes ((${this.ty(key)} 0)) ((${vs.map(v => `(${this.enum(v)})`).join(" ")})))`)
        }
      }

    }

    if (this.uml.tuples) {
      for (let [key, fs] of Object.entries(this.uml.tuples)) {
        this.unnamed_declarations.push(`(declare-datatypes ((${this.ty(key)} 0)) (((${this.mk(key)} ${fs.map((ty, i) => `(${this.tuple(key, i)} ${ty})`).join(" ")}) ${key.startsWith("Nullable") ? `(${this.mk_nil(key)})` : ""})))`)
      }
    }
  }

  total_bound() {
    return [...this.class_summary.values()].map(cl => cl.bound ? cl.bound : this.options.bound).reduce((acc, v) => acc + v, 0)
  }

  gen_ig() {
    if (this.options.ig_class && this.options.ig_bound) {
      const igc = this.options.ig_class
      const igk = this.options.ig_bound
      const iga = this.options.ig_attribute
      this.internal(`inst_gen_${igc}`, this.dom_sized(igc, igk))
      if (iga) {
        const sum = this.class_summary.get(igc)
        const attributes = iga.length ? iga : Object.keys(sum.attributes).filter(at => sum.attributes[at] !== "Bool")
        console.log(attributes)
        if (attributes.length) {
          const r = new Array(igk).fill(undefined).map((_, i) => i)
          const conj = []
          for (let [i, j] of each_distinct(r)) {
            const disj = []
            for (let at of attributes) {
              disj.push(`(distinct ${this.attr(igc, at, i)} ${this.attr(igc, at, j)})`)
            }
            conj.push(`(or ${disj.join(" ")})`)
          }
          this.internal(`inst_gen_attr_${igc}`, `(and ${conj.join(" ")})`)
        }
      }
      // otherwise just (arbitrarily) generate
    }
  }

  sealed = false

  seal() {
    if (this.sealed) {
      return
    }
    this.gen_ig()
    this.gen_data_types()

    for (let cl of this.class_summary.keys()) {
      this.class_constraints(cl)
    }



    this.inheritance_constraints()
    this.sealed = true
  }

  logic_est() {
    const e = Object.keys(this.uml.enums ?? {}).length
    let is_dt = !this.options.enum_int && e
      || Object.keys(this.uml.tuples ?? {}).length
      || [...this.class_summary.values()].some(sum => Object.entries(sum.attributes).some(([attr, ty]) => ty.startsWith("Nullable") && this.attr_ref.has(`${sum.classname}_${attr}`)))
    let lia = this.options.enum_int && e && !this.uml.logic.includes("I") ? "LIA" : ""
    return `QF_${is_dt ? "DT" : ""}${this.uml.logic ?? "LIA"}${lia}`
  }

  logic_written() {
    const l = this.logic_est()
    if (l.includes("DT") && l.includes("S")) {
      // Z3 does not support QF_DTS*
      return "ALL"
    }

    return l
  }

  // (set-option :smt.core.minimize true)
  generate_file(filepath, extra_lines = []) {
    this.seal()

    const rows = [
      `(set-option :produce-models true)`,
      // `(set-option :produce-unsat-cores true)`,
    ]
    if (this.options.core) {
      rows.push(`(set-option :produce-unsat-cores true)`)
    }
    rows.push(...extra_lines)

    if (this.options.set_logic) {
      let logic = this.options.logic_override ?? this.logic_written()
      rows.push(`(set-logic ${logic})`)
    }

    for (let decl of this.unnamed_declarations) {
      rows.push(decl)
    }

    for (let v of this.registered_builtins.values()) {
      rows.push(v)
    }

    for (let f of this.registered_functions.values()) {
      rows.push(f)
    }

    // const agg_assertion = []
    // const agg_names = []

    for (let i = 0; i < this.assertions.length; i++) {
      const a = this.assertions[i]
      // const name = this.assertion_names[i]
      rows.push(`(assert ${a})`)
      // if (this.options.aggregate_assertions && builtin_assertion_prefix.some(pf => name.startsWith(pf))) {
      //   agg_assertion.push(a)
      //   agg_names.push(name)
      // } else {
      //   rows.push(`(assert ${a})`)
      // }
    }

    const name_agg_internals = "agg_internals"

    if (this.options.aggregate_assertions) {
      const conj = []
      for (let a of this.assertion_internal) {
        conj.push(a)
      }
      let expr = `(and ${conj.join("\n")})`
      if (this.options.core) {
        expr = `(! ${expr} :named ${name_agg_internals})`
      }
      rows.push(`(assert ${expr})`)
    } else {
      for (let a of this.assertion_internal) {
        rows.push(`(assert ${a})`)
      }
    }

    // const names = this.assertion_names.filter(name => !agg_names.includes(name)).concat(this.options.aggregate_assertions ? [name_agg_internals] :  [])

    // if (agg_assertion.length) {
    //   const expr = `(and ${agg_assertion.join("\n")})`
    //   if (this.options.core) {
    //     rows.push(`(assert (! ${expr} :named ${name_agg_internals}))`)
    //   } else {
    //     rows.push(`(assert ${expr})`)
    //   }
    // }

    rows.push(`(check-sat)`)
    if (this.options.core) {
      rows.push(`(get-unsat-core)`)
    }
    if (this.options.model) {
      rows.push(`(get-model)`)
    }

    let size_est = 0
    for (let row of rows) {
      size_est += Buffer.byteLength(row, "utf8") + 1
    }

    const h = fs.openSync(filepath, "w")
    for (let row of rows) {
      fs.writeFileSync(h, row + "\n", {
        encoding: "utf8"
      })
    }
    fs.closeSync(h)

    console.log(
      `${this.uml.name} estimated size`,
      Math.round(size_est / 1024),
      `kb (~ ${Math.round(size_est / 1024 / 1024)} mb)`
    )



    // const fml = rows.join("\n")

    if (this.options.bound) {
      console.log(`class bound: ${this.options.bound}`)
    }

    const total_bound = this.total_bound()
    // const bytes = Buffer.byteLength(fml, 'utf8')

    console.log(
      "total:",
      "\n",

      this.registered_builtins.size + this.registered_functions.size + this.unnamed_declarations.length,
      "declarations",
      "\n",

      this.assertion_names.length,
      "assertions",
      "\n",

      total_bound,
      "potential objects",
      "\n",

      rows.length,
      "lines",
      "\n",

      // Math.round(bytes / 1024),
      // `kb (~ ${Math.round(bytes / 1024 / 1024)} mb)`
    )

    const names = this.assertion_names.concat(this.options.aggregate_assertions ? [name_agg_internals] : this.assertion_internal_names)

    console.log(`--- naming list ---\n${names.join(" ")}\n--- end naming list ---`)

    // return fml
  }
}