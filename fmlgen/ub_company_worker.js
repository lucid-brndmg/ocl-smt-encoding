import {ModelEnv} from "./index.js";
import {gen_fml} from "./utils.js";
import {UnboundedEnv} from "./unbounded.js";

const gen = opts => {
  const uml = {
    logic: "S",
    name: "company_worker",

    classes: {
      company: {
        domain: "String"
      },
      worker: {
        firstname: "String",
        lastname: "String",
        id_suffix: "String",
        email: "String"
      }
    },
    assoc: [
      {
        participants: [
          ["company", "employer", null, 1, null],
          ["worker", "employees", 1, null, null]
        ]
      }
    ]
  }

  const cc = "company"
  const cw = "worker"
  const e = new UnboundedEnv(uml, opts)

  e.assert_context(
    cc,
    e.forall_instances(cc, (c) => e.assoc_each_distinct(cc, c, ["employees"], (w1, w2) => `(=> (= ${e.attr(cw, "email", w1)} ${e.attr(cw, "email", w2)}) (= ${w1} ${w2}))`)),
    e.forall_instances(cc, (c) => e.exists_navigate(cc, c, ["employees"], ([_1, w1]) => e.exists_navigate(cc, c, ["employees"], ([_2, w2]) => `(and 
      (distinct ${w1} ${w2})
      (= ${e.attr(cw, "firstname", w1)} ${e.attr(cw, "firstname", w2)})
      (= ${e.attr(cw, "lastname", w1)} ${e.attr(cw, "lastname", w2)})
    )`)))
  )

  e.assert_context(
    cw,
    e.forall_instances(cw, (w) => e.forall_navigate(cw, w, ["employer"], ([_, c]) => {
      const s1 = `(str.++ ${e.attr(cw, "firstname", w)} ".")`
      const s2 = `(str.++ ${s1} ${e.attr(cw, "lastname", w)})`
      const s3 = `(str.++ ${s2} ".")`
      const s4 = `(str.++ ${s3} ${e.attr(cw, "id_suffix", w)})`
      const s5 = `(str.++ ${s4} "@")`
      const s6 = `(str.++ ${s5} ${e.attr(cc, "domain", c)})`
      return `(= ${e.attr(cw, "email", w)} ${s6})`
    })),
    e.forall_instances(cw, (w) => `(and 
      (not (str.contains ${e.attr(cw, "firstname", w)} "@"))
      (not (str.contains ${e.attr(cw, "lastname", w)} "@"))
    )`)
  )

  return e
}

export default gen

