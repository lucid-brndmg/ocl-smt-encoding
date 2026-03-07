import path from "path";

export const rl_date_ops = (e) => {
  const T_DATE = e.ty("Date")

  const op_date_is_before_src = `
(define-fun date_is_before ((target ${T_DATE}) (cmp ${T_DATE})) Bool (or 
  (< (${e.tuple("Date", 0)} target) (${e.tuple("Date", 0)} cmp))
  (and (= (${e.tuple("Date", 0)} target) (${e.tuple("Date", 0)} cmp)) (< (${e.tuple("Date", 1)} target) (${e.tuple("Date", 1)} cmp)))
  (and 
    (= (${e.tuple("Date", 0)} target) (${e.tuple("Date", 0)} cmp)) 
    (= (${e.tuple("Date", 1)} target) (${e.tuple("Date", 1)} cmp)) 
    (< (${e.tuple("Date", 2)} target) (${e.tuple("Date", 2)} cmp))
  )
))
`
  e.def_fun(`date_is_before`, op_date_is_before_src, true)

  const op_date_is_after_src = `
(define-fun date_is_after ((target ${T_DATE}) (cmp ${T_DATE})) Bool (and 
  (distinct target cmp)
  (not (date_is_before target cmp))
))
`
  e.def_fun(`date_is_after`, op_date_is_after_src, true)


  const v_date_now = `date_now`
  e.decl_const(v_date_now, T_DATE)

  return v_date_now
}

export const sum = xs => {
  let x = 0
  for (let i = 0; i < xs.length; i++) {
    x += xs[i]
  }
  return x
}

export const prod = xs => {
  let x = 1
  for (let i = 0; i < xs.length; i++) {
    x *= xs[i]
  }
  return x
}

export const idx_compose = (idx_combo, ks) => {
  let x = 0
  for (let i = 0; i < idx_combo.length; i++) {
    const p = prod(ks.slice(i + 1))
    x += idx_combo[i] * p
  }

  return x
}

export const idx_decompose = (i, ks) => {
  let xs = []
  for (let j = 0; j < ks.length; j++) {
    xs.push(Math.floor(i / prod(ks.slice(j + 1))) % ks[j])
  }

  return xs
}

export const mk_ite = (branches, el, i = 0) => {
  if (el == null && i === branches.length - 1) {
    return branches[i][1]
  }
  if (i === branches.length) {
    return el
  }
  return `(ite ${branches[i][0]} ${branches[i][1]} ${mk_ite(branches, el, i + 1)})`
}

export const graph_closure = (g, x0_set) => {
  let A = new Set(x0_set)
  while (A.size !== 0) {
    const buff = new Set()
    for (let s of A) {
      for (let t of g[s] ?? []) {
        buff.add(t)
      }
    }
    let br = true
    for (let x of buff) {
      if (!A.has(x)) {
        br = false
        A.add(x)
      }
    }
    if (br) {
      return A
    }
  }

  return A
}

export const each_distinct = xs => {
  const ys = []
  for (let i = 0; i < xs.length; i ++) {
    for (let j = i + 1; j < xs.length; j ++) {
      ys.push([xs[i], xs[j]])
    }
  }

  return ys
}
export const set_intersection = (s1, s2) => {
  // why does JS sets don't have this or union ???

  const A = new Set()
  const s1s = new Set(s1)
  const s2s = new Set(s2)
  for (let x of s1s) {
    if (s2s.has(x)) {
      A.add(x)
    }
  }

  for (let x of s2s) {
    if (s1s.has(x)) {
      A.add(x)
    }
  }

  return A
}

export const gen_fml = (e, p = `gen/`) => {
  // const filename = path.basename(process.argv[1], ".js")
  const fml_filename = `${e.filename()}.smt2`
  const fml_fp = path.join(p, fml_filename)
  e.generate_file(fml_fp)
  // fs.writeFileSync(fml_fp, e.generate(), "utf8")
  console.log(`generated: ${fml_fp}`, "\n")

  // if (e.set_listener) {
  //   let md = {ref: 0}
  //
  //   e.set_listener("depth", (ctx, d) => {
  //     console.log(d)
  //     md.ref = Math.max(md.ref, d)
  //   })
  //
  //   console.log("Maximum navigation depth:", md.ref)
  // }

  return fml_filename
}

export const mk_options = (sat = false, comp = false, k = 6) => ({
  lite: true,
  core: false,
  model: true,
  dense_instance: true,
  pseudo_size: false,
  aggregate_assertions: true,
  silent: true,

  enum_int: true,
  logic_override: null,
  set_logic: false,

  ig_class: null,
  ig_bound: 5,
  ig_attribute: [], // [attributes] | null

  filename_suffix: null,

  sat,
  bound: k,

  unbounded_compatible: comp,

  // strict | loose | none
  unbounded_multiplicity_mode: "strict",
  unbounded_multiplicity_counting: true,

  // I | DT | BV
  unbounded_classifier_sort: "DT",
  // available if unbounded_classifier_sort = BV
  unbounded_classifier_bound: 4
})

export const lst = xs => xs[xs.length - 1]