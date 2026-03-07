import {each_distinct, graph_closure, lst, mk_options, set_intersection} from "./utils.js";
import fs from "fs";

const id_inst_nil = `inst_nil`
const id_class = cls => `class_${cls}`
const id_assoc_rel = (assoc_id) => `asc_${assoc_id}`
const id_to_assoc_class = (assoc_id, ac) => `ascc_${assoc_id}_${ac}`
const id_from_assoc_class = (assoc_id, ac, i) => `ascc_${assoc_id}_${ac}_${i}`

const id_assoc_end = (assoc_id, end_id) => `asce_${assoc_id}_${end_id}`

const id_attr = (cls, attr) => `attr_${cls}_${attr}`
// const fn_assoc_end = (assoc_id, field, params) => `(${fn_id_assoc_end(assoc_id, field)} ${params.join(" ")})`
const id_tuple_idx = (ty, i) => `${ty}_${i}`

const qv = (id) => `qv_${id}`



export class UnboundedEnv {
  uml
  options
  fml_sorts = new Map()
  fml_declarations = new Map()
  fml_declarations_unnamed = []
  fml_functions_unnamed = []
  class_summary = new Map()
  class_inheritance_graph = {}

  assertions = []
  assertion_internal = []
  assertion_internal_names = []
  assertion_names = []
  assertion_count = new Map()

  attr_ref = new Map()
  sealed = false
  id_qv = 0
  unnamed_assertion_id = 0

  curr_nav_depth = 0
  max_nav_depth = 0


  assign_qv() {
    return qv(this.id_qv++)
  }

  class_sort() {
    switch (this.options.unbounded_classifier_sort) {
      case "I": return "Int"
      case "DT": return "Classifier"
      case "BV": return `(_ BitVec ${this.options.unbounded_classifier_bound})`
    }
  }

  is_nil(v) {
    return `(= ${v} ${id_inst_nil})`
  }

  constructor(uml, options) {
    if (!options) {
      throw new Error("Unspecified configuration")
    }
    this.options = options // ?? mk_options()
    this.uml = uml
    const cs = this.class_sort()
    const classnames = Object.keys(uml.classes)
    // this.decl_fun(id_class_nil, [`Int`], `Bool`)
    for (let class_name of classnames) {
      let attributes = {}
      let assoc_class_classes = []
      const class_decl = uml.classes[class_name]
      const sum = {
        classname: class_name,
        // search here for parent-class, search graph for children
        parents: class_decl["_extends"] ?? [],
        attributes,
        assoc_class_classes,
        associations: {},
        depth: 1
      }
      this.class_summary.set(class_name, sum)
      for (let attr of Object.keys(class_decl)) {
        switch (attr) {
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
            for (let [ptc_class] of ptc) {
              assoc_class_classes.push(ptc_class)
            }
            sum.depth = ptc.length
            this._register_assoc(class_decl["_assoc"], class_name)
            break
          }

          default: {
            const ty = class_decl[attr]
            if (ty.startsWith("Nullable")) {
              const name = ty.slice("Nullable".length)
              this._register_nullable_sort(name)
            }
            // this.decl_fun(id_attr(class_name, attr), [`Int`], ty)
            attributes[attr] = class_decl[attr]
          }
        }
      }

      this.decl_fun(id_class(class_name), [cs], `Bool`)
    }

    for (let assoc of uml.assoc) {
      this._register_assoc(assoc)
    }
  }

  // set_listener(ev, f) {
  //   this.events[ev] = f
  // }

  _register_assoc(assoc, ac = null) {
    const cs = this.class_sort()
    const {participants, is_unary} = assoc
    const binary_pred = []
    const is_nary = participants.length > 2
    const xs = participants.map((_, i) => i)
    const overall_id = participants.map(([cls, fld]) => `${cls}_${fld}`).join("-")
    const overall_params = xs.map(i => `i${i}`)
    const overall_pred = id_assoc_rel(overall_id)
    const overall_call = `(${overall_pred} ${overall_params.join(" ")})`
    // const overall_classes = participants.map(([c]) => c)
    const axiom = []
    for (let [i, j] of each_distinct(xs)) {
      const s = participants[i]
      const t = participants[j]
      const [s_class, s_field] = s
      const [t_class, t_field] = t
      const id = `${s_class}_${s_field}-${t_class}_${t_field}`
      const pred_assoc = id_assoc_rel(id)
      this.decl_fun(pred_assoc, [cs, cs], "Bool")

      axiom.push(`(forall ((a ${cs}) (b ${cs})) (=> (${pred_assoc} a b) (and (${id_class(s_class)} a) (${id_class(t_class)} b))))`)


      if (is_nary) {
        binary_pred.push(`(${pred_assoc} i${i} i${j})`)
        const ys = xs.filter(x => x !== i && x !== j)
        axiom.push(`(forall ((i${i} ${cs}) (i${j} ${cs})) (=> (${pred_assoc} i${i} i${j}) (exists (${ys.map(i => `(i${i} ${cs})`).join(" ")}) ${overall_call})))`)
      }

      this._register_assoc_end(s, t, id, pred_assoc, false)

      if (!is_unary) {
        this._register_assoc_end(t, s, id, pred_assoc, true)
      }
    }

    if (is_nary) {
      axiom.push(`(forall (${xs.map(i => `(i${i} ${cs})`).join(" ")}) (=> ${overall_call} (and ${binary_pred.join(" ")})))`)
      this.decl_fun(overall_pred, xs.map(_ => cs), `Bool`)
    }

    if (ac) {
      const ac_to = id_to_assoc_class(overall_id, ac)
      const ac_from = xs.map(i => id_from_assoc_class(overall_id, ac, i))
      const to_call = `(${ac_to} ${overall_params.join(" ")})`
      // const axiom1 = `(forall ((u ${cs}) ${overall_params.map(v => `(${v} ${cs})`).join(" ")}) (=> (and (${id_class(ac)} u) ${overall_params.map((v, i) => `(${overall_classes[i]} ${v})`).join(" ")}) (and
      //   ${overall_call}
      //   (= u (${ac_to} ${ac_from.map(pred => `(${pred} u)`).join(" ")}))
      // )))`
      // const axiom2 = `(forall (${xs.map(i => `(i${i} ${cs})`).join(" ")}) (=> ${overall_call} (and
      //   (${id_class(ac)} ${to_call})
      //   ${ac_from.map((pred, i) => `(= i${i} (${pred} ${to_call}))`).join(" ")}
      // )))`

      const overall_qv = overall_params.map(v => `(${v} ${cs})`).join(" ")

      const axiom1 = `(forall (${overall_qv}) (=> ${overall_call} (${id_class(ac)} ${to_call})))`

      const axiom2 = `(forall ((u ${cs})) (=> (${id_class(ac)} u) (and 
        (${overall_pred} ${xs.map(i => `(${ac_from[i]} u)`).join(" ")})
      )))`


      this.decl_fun(ac_to, xs.map(_ => cs), cs)


      const ac_summary = this.class_summary.get(ac)
      for (let i of xs) {
        const [cls, fld] = participants[i]
        this.decl_fun(ac_from[i], [cs], cs)
        ac_summary.associations[fld] = {
          classname: cls,
          nav: (ctx, prev, exists) => {
            // assoc -> src
            return [e => e, `(${ac_from[i]} ${prev})`]
          }
        }
        this.class_summary.get(cls).associations[ac] = {
          classname: ac,
          nav: (ctx, prev, exists) => {
            // src -> assoc
            const qvs = xs.map(j => i === j ? prev : ctx.assign_qv())
            const v = `(${ac_to} ${qvs.join(" ")})`
            const rel = `(${overall_pred} ${qvs.join(" ")})`
            return [e => `(${exists ? "exists" : "forall"} (${qvs.filter(v => v !== prev).map(v => `(${v} ${cs})`).join(" ")}) (${exists ? `and` : "=>"} ${rel} ${e}))`, v]
          }
        }
      }

      axiom.push(axiom1, axiom2)
    }

    this.internal(`assoc_${overall_id}`, `(and ${axiom.join(" ")})`)
  }

  _register_assoc_end(s, t, id, rel, inv) {
    const [s_class, s_field] = s
    const [t_class, t_field, lo, eq, hi] = t
    const sum_src = this.class_summary.get(s_class)
    if (sum_src.associations[t_field]) {
      throw new Error(`Duplicated association: ${s_class}.${t_field}`)
    }
    const axiom = []
    const end_id = `${s_class}-${t_field}`
    const rel_call = inv ? `(${rel} j i)` : `(${rel} i j)`
    const cls_s = id_class(s_class)
    const cls_t = id_class(t_class)
    const acc = id_assoc_end(id, end_id)

    sum_src.associations[t_field] = {
      classname: t_class,
      predicate: rel,
      source_class: s_class,
      is_inv: inv,
      mul: [lo, eq, hi]
    }

    const cs = this.class_sort()

    if (lo === 0 && hi === 1 || eq === 1) {
      this.decl_fun(acc, [cs], cs)
      // const axiom = `(forall ((i Int) (j Int)) (=> (${rel} i j) (= j (${acc} i))))`
      axiom.push(
        `(forall ((i ${cs}) (j ${cs})) (=> ${rel_call} (= j (${acc} i))))`,
        `(forall ((i ${cs}) (j ${cs})) (=> (and (${cls_s} i) (${cls_t} j) (= j (${acc} i))) ${rel_call}))`,
        eq === 1
          ? `(forall ((i ${cs})) (=> (${cls_s} i) (${cls_t} (${acc} i))))` // 1
          : `(forall ((i ${cs})) (=> (${cls_s} i) (or ${this.is_nil(`(${acc} i)`)} (${cls_t} (${acc} i)) )))` // 0..1
      )

      sum_src.associations[t_field].nav = (ctx, i, exists) => {
        // [null, `(${acc} ${i})`]
        const v = `(${acc} ${i})`
        const f = eq === 1
          ? e => e
          : e => `(${exists ? "and" : "=>"} (not ${this.is_nil(v)}) ${e})`
        return [f, v]
      }
    } else {
      sum_src.associations[t_field].nav = (ctx, i, exists) => {
        const v = ctx.assign_qv()
        const q = exists ? `exists` : `forall`
        const app = exists ? `and` : `=>`
        const cond = `(${rel} ${inv ? `${v} ${i}` : `${i} ${v}` })`
        return [e => `(${q} ((${v} ${cs})) (${app} ${cond} ${e}))`, v]
      }
      const ext = (lo >= 0 && hi > 0 || lo > 0 || eq != null)
      sum_src.associations[t_field].existential = ext

      if (ext && this.options.unbounded_multiplicity_mode === "strict") {
        if (this.options.unbounded_multiplicity_counting) {
          // const m = lo ?? eq
          // const n = hi ?? eq
          //
          // const dis = []
          // for (let k = m; k <= n; k++) {
          //   if (k === 0) {
          //     dis.push(`(not (exists ((j ${cs})) ${rel_call}))`)
          //   } else if (k === 1) {
          //     dis.push(`(and
          //       (forall ((j1 ${cs}) (j2 ${cs})) (=> (and (${rel} ${inv ? `j1 i` : "i j1"} ) (${rel} ${inv ? `j2 i` : `i j2`})) (= j1 j2)))
          //       (exists ((j ${cs})) ${rel_call})
          //     )`)
          //   } else {
          //     dis.push(this.counting_quantification(eq, v => inv ? `(${rel} ${v} i)` : `(${rel} i ${v})`))
          //   }
          // }
          axiom.push(`(forall ((i ${cs})) (=> (${cls_s} i) ${this.counting_mul(lo, eq, hi, rel, inv)} ))`)
        } else {
          console.log("rewrite multiplicity to existential", lo, eq, hi)
          axiom.push(`\n;; WARN \n(forall ((i ${cs})) (=> (${cls_s} i) (exists ((j ${cs})) ${rel_call})))\n`)
        }
      }
    }

    if (axiom.length) {
      this.internal(`assoc_end_${id}_${end_id}`, `(and ${axiom.join("\n")})`)
    }

    // const sum_src = this.class_summary.get(s_class)
    // if (sum_src.associations[t_field]) {
    //   throw new Error(`Duplicated association: ${s_class}.${t_field}`)
    // }
  }

  counting_mul(lo, eq, hi, rel, inv) {
    const cs = this.class_sort()
    const rel_call = `(${rel} ${inv ? `j i` : `i j`})`

    if (hi != null || eq != null) {
      const m = lo ?? eq
      const n = hi ?? eq
      // at most or exact
      const dis = []
      for (let k = m; k <= n; k++) {
        if (k === 0) {
          dis.push(`(not (exists ((j ${cs})) ${rel_call}))`)
        } else if (k === 1) {
          dis.push(`(and 
                (forall ((j1 ${cs}) (j2 ${cs})) (=> (and (${rel} ${inv ? `j1 i` : "i j1"} ) (${rel} ${inv ? `j2 i` : `i j2`})) (= j1 j2)))
                (exists ((j ${cs})) ${rel_call})
              )`)
        } else {
          dis.push(this.counting_quantification(k, v => inv ? `(${rel} ${v} i)` : `(${rel} i ${v})`))
        }
      }

      const expr = dis.length > 1
        ? `(or ${dis.join(" ")})`
        : dis[0]

      return `(and 
        ${expr}
        (not ${this.counting_quantification(n + 1, v => inv ? `(${rel} ${v} i)` : `(${rel} i ${v})`)})
      )`
    } else {
      // at least
      return this.counting_quantification(lo, v => inv ? `(${rel} ${v} i)` : `(${rel} i ${v})`)
    }
  }

  counting_quantification(k, cond_each, extra_cond = "") {
    const cs = this.class_sort()
    const xs = new Array(k).fill(undefined).map((_, i) => i)
    const vs = xs.map(i => `x${i}`)
    const qvs = vs.map(v => `(${v} ${cs})`)
    const calls = vs.map(v => cond_each(v))
    return `(exists (${qvs.join(" ")}) (and 
      ${calls.join(" ")} ${extra_cond}
      ${vs.length > 1 ? `(distinct ${vs.join(" ")})` : "" }
    ))`
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

  mk(type_name) {
    return `mk${type_name}`
  }

  mk_nil(type_name) {
    return `mk${type_name}n`
  }

  _register_nullable_sort(t) {
    const kind = `Nullable${t}`
    const v = `(declare-datatypes ((${kind} 0)) (
  ((${this.mk(kind)} (content ${t})) (${this.mk_nil(kind)}))
))`
    this.fml_sorts.set(kind, v)
    // this.fml_declarations_unnamed.push(v)
    return kind
  }

  decl_const(name, ty) {
    if (this.fml_declarations.has(name)) {
      throw new Error("Duplicated var decl" + name + ty)
    }
    this.fml_declarations.set(name, `(declare-const ${name} ${ty})`)
  }

  decl_fun(name, accepts, returns) {
    if (this.fml_declarations.has(name)) {
      throw new Error(`Duplicated fun decl ` + name+ accepts+ returns)
    }
    this.fml_declarations.set(name, `(declare-fun ${name} (${accepts.join(" ")}) ${returns})`)
  }

  class_depth(src_class) {
    return this.class_summary.get(src_class).depth
  }

  incr_depth(d = 1) {
    this.curr_nav_depth += d
    if (d > 0) {
      this.max_nav_depth = Math.max(this.curr_nav_depth, this.max_nav_depth)
      // this.events["depth"]?.(this, this.curr_nav_depth)
    }
  }

  with_instances(q, src_class, f) {
    const d = this.class_depth(src_class)
    // const sum = this.class_summary.get(src_class)
    this.incr_depth(d)

    // this.max_nav_depth += d
    const v = this.assign_qv()
    const cs = this.class_sort()
    const body = f(v)

    this.incr_depth(-d)

    return `(${q} ((${v} ${cs})) (${q === "forall" ? "=>" : "and"} (${id_class(src_class)} ${v}) ${body}))`
  }

  forall_instances(src_class, f) {
    return this.with_instances("forall", src_class, f)
  }

  exists_instances(src_class, f) {
    return this.with_instances("exists", src_class, f)
  }

  ty(t) {
    return t
  }

  iterate_navigate(src_class, src_qv, path, f, exist = false) {
    let sum = this.class_summary.get(src_class)
    // this `ref` indicates (yet) another annoying JavaScript feature/bug
    // without it, stack overflow
    let expr = {ref: x => x}
    const idents = [src_qv]
    const nav_classes = []
    // console.log(path)
    for (let elem of path) {
      const g = expr.ref
      // const p = expr([...idents], lst(idents))
      if (typeof elem === "function") {
        // select
        const pred = elem([...idents], lst(idents))
        const pref = exist ? `and` : "=>"
        expr.ref = ((x) => g(`(${pref} ${pred} ${x})`))
      } else {
        // assoc end
        // const qvn = this.assign_qv()
        const assoc = sum.associations[elem]
        sum = this.class_summary.get(assoc.classname)
        // const [pred, qvn] = assoc.nav(this, lst(idents))

        const [e, qvn] = assoc.nav(this, lst(idents), exist)
        expr.ref = (x => g(e(x))) // (x, prev) => prev(e(x))
        // qvn might not be assigned
        // it can be function calls
        idents.push(qvn)
        nav_classes.push(sum.classname)
      }
    }
    const d = nav_classes.map(cl => this.class_depth(cl)).reduce((acc, d) => acc + d, 0)
    this.incr_depth(d)

    const s = expr.ref(f(idents, lst(idents)))

    this.incr_depth(-d)
    return s
  }

  // iterate_navigate_n(src_class, src_qv, path, f, n) {
  //
  // }

  forall_navigate(src_class, src_qv, path, f) {
    return this.iterate_navigate(src_class, src_qv, path, f, false)
  }

  exists_navigate(src_class, src_qv, path, f) {
    return this.iterate_navigate(src_class, src_qv, path, f, true)
  }

  not_empty(src_class, src_qv, path) {
    return this.exists_navigate(src_class, src_qv, path, (vs) => `true`)
  }

  is_empty(src_class, src_qv, path) {
    return `(not ${this.not_empty(src_class, src_qv, path)})`
  }

  size_leq1(src_class, src_qv, path) {
    // 0 .. 1
    return `(or ${this.forall_navigate(src_class, src_qv, path, (_, qv1) => this.forall_navigate(src_class, src_qv, path, (_, qv2) => `(= ${qv1} ${qv2})`))} ${this.is_empty(src_class, src_qv, path)})`
  }

  size_eq1(src_class, src_qv, path) {
    // 1
    return `(and 
      ${this.size_leq1(src_class, src_qv, path)}
      ${this.not_empty(src_class, src_qv, path)}
    )`
  }



  size_gt1(src_class, src_qv, path) {
    return `(and 
      ${this.forall_navigate(src_class, src_qv, path, (_, v) => this.exists_navigate(src_class, src_qv, path, (_, v2) => `(distinct ${v} ${v2})`))}
      ${this.not_empty(src_class, src_qv, path)}
    )`
  }

  // size_gen_aux(src_class, src_qv, path, n) {
  //
  // }

  size_gen(src_class, src_qv, path, n) {
    // n >= 2

    this.forall_navigate(src_class, src_qv, path)
    this.counting_quantification()
  }

  assoc_each_distinct(src_class, src_i, path, f_distinct) {
    if (!path?.length) {
      return this.forall_instances(src_class, j => `(=> (distinct ${src_i} ${j}) ${f_distinct(src_i, j)})`)
    }

    return this.iterate_navigate(src_class, src_i, path, vs1 => this.iterate_navigate(src_class, src_i, path, vs2 => {
      const v1 = lst(vs1)
      const v2 = lst(vs2)
      return `(=> (distinct ${v1} ${v2}) ${f_distinct(v1, v2)})`
    }, false), false)
  }

  attr(classname, field, qv) {
    const sum = this.class_summary.get(classname)
    if (!sum.attributes[field]) {
      throw new Error(`No attribute: ${classname}.${field}`)
    }
    const id = id_attr(classname, field)
    this.attr_ref.set(id, (this.attr_ref.get(id) ?? 0) + 1)
    return `(${id_attr(classname, field)} ${qv})`
  }

  exists_cast(src_class, src_i, target_class, f = null) {
    const sum_s = this.class_summary.get(src_class)
    const sum_t = this.class_summary.get(target_class)
    if (sum_s.parents.includes(target_class)) {
      // up-casting
      // do nothing
      return f ? f(src_i) : `true`
    } else if (sum_t.parents.includes(src_class)) {
      // down-casting
      // check is_T(i)

      const pred = `(${id_class(target_class)} ${src_i})`
      if (!f) {
        return pred
      }
      return `(and ${pred} ${f(src_i)})`
    } else {
      throw new Error(`Indirect inheritance: ${src_class} ${target_class}`)
    }
  }

  exists_cast_path(src_class, src_i, target_class_path, f = null) {
    let e = x => x
    let s = src_class
    for (let t of target_class_path) {
      const sum_s = this.class_summary.get(s)
      const sum_t = this.class_summary.get(t)
      if (sum_t.parents.includes(s)) {
        // down-casting
        // check is_T(i)
        const pred = `(${id_class(t)} ${src_i})`
        e = x => `(and ${pred} ${x})`
      }else if (!sum_s.parents.includes(t)) {
        throw new Error(`Indirect inheritance: ${s} ${t}`)
      }

      s = t
    }

    return e(f ? f(src_i) : `true`)
  }


  path_includes_all(sc, si, sp, tc, ti, tp) {
    return this.forall_navigate(tc, ti, tp, (_, t) => this.exists_navigate(sc, si, sp, (_, s) => `(= ${s} ${t})`))
  }

  path_eq(sc, si, sp, tc, ti, tp) {
    return `(and 
      ${this.path_includes_all(sc, si, sp, tc, ti, tp)}
      ${this.path_includes_all(tc, ti, tp, sc, si, sp)}
    )`
  }

  assoc_path_includes_all(src_class, src_i, path, target_path) {
    // target is subset of path
    // forall t : exists s : s = t
    return this.forall_navigate(src_class, src_i, target_path, (_, qv_t) => this.exists_navigate(src_class, src_i, path, (_, qv_s) => `(= ${qv_s} ${qv_t})`))
  }

  assoc_path_excludes_all(src_class, src_i, path, target_path) {
    return this.forall_navigate(src_class, src_i, target_path, (_, qv_t) => this.forall_navigate(src_class, src_i, path, (_, qv_s) => `(distinct ${qv_s} ${qv_t})`))
  }

  assoc_path_eq(src_class, src_i, p1, p2) {
    return `(and 
      ${this.assoc_path_includes_all(src_class, src_i, p1, p2)}
      ${this.assoc_path_includes_all(src_class, src_i, p2, p1)}
    )`
  }


  app(call, ...xs) {
    // todo: intercept calls here
    // console.log("app", xs)
    return `(${call} ${xs.join(" ")})`
  }

  enum(member) {
    return member
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

  assert_context(src_class, ...expr) {
    let ctx_cnt = 0
    if (this.assertion_count.has(src_class)) {
      ctx_cnt = this.assertion_count.get(src_class)
    }
    this.assertion_count.set(src_class, ctx_cnt + 1)

    for (let i = 0; i < expr.length; i++) {
      this.named(`assert_${src_class}_${ctx_cnt}_${i}`, expr[i])
    }
  }

  tuple(type_name, index) {
    return id_tuple_idx(type_name, index)
  }

  gen_data_types() {
    const cs = this.class_sort()
    if (this.uml.enums) {
      if (this.options.enum_int) {
        const axiom = []
        for (let [key, vs] of Object.entries(this.uml.enums)) {
          for (let i = 0; i < vs.length; i++) {
            const v = vs[i]
            this.decl_const(v, `Int`)
            axiom.push(`(= ${v} ${i})`)

            // this.named(`enum_${key}_${v}`)
          }
        }
        this.internal(`enum_int_table`, `(and ${axiom.join("\n")})`)
      } else {
        for (let [key, vs] of Object.entries(this.uml.enums)) {
          this.fml_declarations_unnamed.push(`(declare-datatypes ((${key} 0)) ((${vs.map(v => `(${v})`).join(" ")})))`)
        }
      }

    }

    if (this.uml.tuples) {
      for (let [key, fs] of Object.entries(this.uml.tuples)) {
        this.fml_declarations_unnamed.push(`(declare-datatypes ((${key} 0)) (((${this.mk(key)} ${fs.map((ty, i) => `(${id_tuple_idx(key, i)} ${ty})`).join(" ")}) ${key.startsWith("Nullable") ? `(${this.mk_nil(key)})` : ""})))`)
      }
    }
  }

  def_fun(name, code, force = false) {
    if (this.options.lite && !force) {
      if (!this.options.silent) {
        console.log(`skip decl-fun ${name}`)
      }
      return
    }

    // (define-fun ...)
    if (this.fml_declarations.has(name)) {
      throw new Error(`Duplicated fun decl ${name} : ${code}`)
    }

    this.fml_declarations.set(name, code)
  }

  class_constraints(cls) {
    const sum = this.class_summary.get(cls)
    const axioms = [
      // inst
      // `(exists ((i Int)) (${id_class(cls)} i))`,
      `(not (${id_class(cls)} ${id_inst_nil}))`
    ]

    const inst_axiom = [
      `(${id_class(cls)} i)`
    ]
    const cs = this.class_sort()

    if (this.options.unbounded_multiplicity_mode === "loose") {
      if (this.options.unbounded_multiplicity_counting) {
        for (let t_field of Object.keys(sum.associations)) {
          const assoc = sum.associations[t_field]
          if (assoc.existential) {
            const [lo, eq, hi] = assoc.mul
            // const m = lo ?? eq
            // const n = hi ?? eq
            // const inv = assoc.is_inv
            // const rel = assoc.predicate
            // const rel_call = `(${rel} ${inv ? `j i` : `i j`})`
            //
            // const dis = []
            // for (let k = m; k <= n; k++) {
            //   if (k === 0) {
            //     dis.push(`(not (exists ((j ${cs})) ${rel_call}))`)
            //   } else {
            //     dis.push(this.counting_quantification(eq, v => inv ? `(${rel} ${v} i)` : `(${rel} i ${v})`))
            //   }
            // }
            inst_axiom.push(this.counting_mul(lo, eq, hi, assoc.predicate, assoc.is_inv))

            // axiom.push(`(forall ((i ${cs})) (=> (${cls_s} i) )`)

            // inst_axiom.push(`(exists ((j ${cs})) (${assoc.predicate} ${assoc.is_inv ? `j i` : `i j`}))`)
          }
        }
      } else {
        for (let t_field of Object.keys(sum.associations)) {
          const assoc = sum.associations[t_field]
          if (assoc.existential) {
            inst_axiom.push(`(exists ((j ${cs})) (${assoc.predicate} ${assoc.is_inv ? `j i` : `i j`}))`)
          }
        }
      }
    }

    axioms.push(`(exists ((i ${cs})) (and ${inst_axiom.join(" ")}))`)


    for (let [attr, ty] of Object.entries(sum.attributes)) {
      if (!this.attr_ref.get(id_attr(cls, attr))) {
        continue
      }
      const enum_int = this.options.enum_int && this.uml.enums?.[ty]
      if (enum_int) {
        const attr_v = `(${id_attr(cls, attr)} i)`
        const hi = this.uml.enums[ty].length
        axioms.push(`(forall ((i ${cs})) (=> (${id_class(cls)} i) (and (>= ${attr_v} 0) (<= ${attr_v} ${hi}))))`)
        // this.internal(`enum_bound_${cls}_${ty}`, axiom)
      }
      this.decl_fun(id_attr(cls, attr), [cs], enum_int ? `Int` : ty)
    }

    const cast = [
      // `(not (${id_class_nil} i))`
      // `true`
    ]
    for (let p of sum.parents) {
      cast.push(`(${id_class(p)} i)`)
    }
    if (cast.length) {
      axioms.push(`(forall ((i ${cs})) (=> (${id_class(cls)} i) (and ${cast.join(" ")})))`)
    }
    this.internal(`class_inst_${cls}`, `(and ${axioms.join(" ")})`)
  }

  class_disjoint() {
    // return;

    // todo: try another expression

    const G = this.class_inheritance_graph
    const axioms = []
    const classes = [...this.class_summary.keys()]
    for (let [A, B] of each_distinct(classes)) {
      const cl_A = graph_closure(G, [A])
      const cl_B = graph_closure(G, [B])
      const R = set_intersection(cl_A, cl_B)
      if (R.size === 0) {
        axioms.push(`(not (and (${id_class(A)} i) (${id_class(B)} i)))`)
      }
    }

    const cs = this.class_sort()

    if (axioms.length) {
      this.internal(`class_disjoint`, `(forall ((i ${cs})) (and ${axioms.join(" ")}))`)
    }
  }

  logic_est() {
    let is_enum = Object.keys(this.uml.enums ?? {}).length
    let is_dt = !this.options.enum_int && is_enum
      || Object.keys(this.uml.tuples ?? {}).length
      || [...this.class_summary.values()].some(sum => Object.entries(sum.attributes).some(([attr, ty]) => ty.startsWith("Nullable") && this.attr_ref.has(id_attr(sum.classname, attr))))
      || this.options.unbounded_classifier_sort === "DT"
    const logic = this.uml.logic ?? ""
    let is_lia = is_enum && this.options.enum_int && !logic.includes("LIA")
    let is_bv = this.options.unbounded_classifier_sort === "BV"
    return `${is_bv ? "BV" : ""}${is_dt ? "DT" : ""}UF${is_lia ? "LIA" : ""}${logic}`
  }

  logic_written() {
    const l = this.logic_est()
    // if (l.includes("DT") && l.includes("S")) {
    //   // Z3 does not support DTS*
    //   return "ALL"
    // }

    return l
  }

  gen_ig() {
    if (this.options.ig_class && this.options.ig_bound) {
      const igc = this.options.ig_class
      const igk = this.options.ig_bound
      const iga = this.options.ig_attribute
      const cs = this.class_sort()
      const dist = []
      const mem = []
      for (let i = 0; i < igk; i++) {
        const v = `ig${i}`
        this.decl_const(v, cs)
        dist.push(v)
        mem.push(`(${id_class(igc)} ${v})`)
      }
      this.internal(`inst_gen_${igc}`, `(and ${mem.join(" ")} (distinct ${dist.join(" ")}))`)
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
              disj.push(`(distinct ${this.attr(igc, at, `ig${i}`)} ${this.attr(igc, at, `ig${j}`)})`)
            }
            conj.push(`(or ${disj.join(" ")})`)
          }
          this.internal(`inst_gen_attr_${igc}`, `(and ${conj.join(" ")})`)
        }
      }
      // otherwise just (arbitrarily) generate
    }
  }

  seal() {
    if (this.sealed) {
      return
    }

    this.gen_ig()

    this.gen_data_types()
    for (let c of this.class_summary.keys()) {
      this.class_constraints(c)
    }
    this.class_disjoint()

    if (this.options.unbounded_classifier_sort === "DT") {
      this.fml_sorts.set("Classifier", `(declare-sort Classifier 0)`)
    }

    const cs = this.class_sort()

    // switch (this.options.unbounded_null_mode) {
    //   case "const": {
    //     this.decl_const(id_inst_nil, cs)
    //     this.fml_functions_unnamed.push(`(define-fun ${id_class_nil} ((x ${cs})) Bool (= x ${id_inst_nil}))`)
    //     break
    //   }
    //   case "pred": {
    //     this.decl_fun(id_class_nil, [cs], `Bool`)
    //     break
    //   }
    // }

    this.decl_const(id_inst_nil, cs)
    // this.fml_functions_unnamed.push(`(define-fun ${id_class_nil} ((x ${cs})) Bool (= x ${id_inst_nil}))`)

    this.sealed = true
  }

  generate(extra_lines = []) {
    this.seal()
    const rows = [`(set-option :produce-models true)`]
    if (this.options.core) {
      rows.push(`(set-option :produce-unsat-cores true)`)
    }
    rows.push(...extra_lines)

    if (this.options.set_logic) {
      let logic = this.options.logic_override ?? this.logic_written()
      rows.push(`(set-logic ${logic})`)
    }

    for (let srt of this.fml_sorts.values()) {
      rows.push(srt)
    }

    for (let decl of this.fml_declarations_unnamed) {
      rows.push(decl)
    }

    for (let v of this.fml_declarations.values()) {
      rows.push(v)
    }

    for (let v of this.fml_functions_unnamed) {
      rows.push(v)
    }

    for (let i = 0; i < this.assertions.length; i++) {
      const a = this.assertions[i]
      rows.push(`(assert ${a})`)
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

    rows.push(`(check-sat)`)
    if (this.options.core) {
      rows.push(`(get-unsat-core)`)
    }
    if (this.options.model) {
      rows.push(`(get-model)`)
    }

    console.log(
      "total:",
      "\n",

      this.fml_declarations.size + this.fml_declarations_unnamed.length,
      "declarations",
      "\n",

      this.assertion_names.length,
      "assertions",
      "\n",

      rows.length,
      "lines",
      "\n",

      this.max_nav_depth,
      "MND\n"

      // Math.round(bytes / 1024),
      // `kb (~ ${Math.round(bytes / 1024 / 1024)} mb)`
    )

    const names = this.assertion_names.concat(this.options.aggregate_assertions ? [name_agg_internals] : this.assertion_internal_names)

    console.log(`--- naming list ---\n${names.join(" ")}\n--- end naming list ---`)


    return rows.join("\n")
  }

  filename() {
    const sat = this.options.sat
      ? "sat"
      : this.options.core ? "core" : "unsat"
    
    return `${this.uml.name ?? "model"}_${sat}_${this.options.unbounded_multiplicity_mode}_unbounded${this.options.filename_suffix ?? ""}`
  }

  total_bound() {
    return 0
  }

  generate_file(file, lines) {
    const smt2 = this.generate(lines)
    fs.writeFileSync(file, smt2, "utf8")
  }
}