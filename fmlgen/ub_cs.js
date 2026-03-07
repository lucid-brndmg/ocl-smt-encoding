import {ModelEnv, pb_sum} from "./index.js";
import {gen_fml} from "./utils.js";
import {UnboundedEnv} from "./unbounded.js";

const gen = opts => {
  const uml = {
    logic: "S",
    name: "cs",
    enums: {
      Gender: ["Female", "Male", "GN"],
      CivilStatus: ["Single", "Married", "Divorced", "Widowed", "CSN"]
    },
    classes: {
      person: {
        name: "NullableString",
        civil_stat: "CivilStatus",
        gender: "Gender"
      }
    },

    assoc: [
      {
        participants: [
          ["person", "husband", 0, null, 1],
          ["person", "wife", 0, null, 1]
        ]
      }
    ]
  }

  // spouse():Person=if gender=#female then husband else wife endif

  const e = new UnboundedEnv(uml, opts)
  const cp = "person"
  e.assert_context(
    cp,
    e.forall_instances(cp, (p) => `(and 
      (distinct ${e.attr(cp, "name", p)} ${e.mk_nil("NullableString")})
      (distinct ${e.attr(cp, "civil_stat", p)} ${e.enum("CSN")})
      (distinct ${e.attr(cp, "gender", p)} ${e.enum("GN")})
    )`),
    e.forall_instances(cp, (p) => e.assoc_each_distinct(cp, p, [], (p1, p2) => `(=> (distinct ${p1} ${p2}) (distinct ${e.attr(cp, "name", p1)} ${e.attr(cp, "name", p2)}))`)),
    e.forall_instances(cp, (p) => `(=> 
      (= ${e.attr(cp, "gender", p)} ${e.enum("Female")})
      ${e.is_empty(cp, p, ["wife"])}
    )`),
    e.forall_instances(cp, (p) => `(=> 
      (= ${e.attr(cp, "gender", p)} ${e.enum("Male")})
      ${e.is_empty(cp, p, ["husband"])}
    )`),
    e.forall_instances(cp, (p) => `(= 
      (= ${e.attr(cp, "civil_stat", p)} ${e.enum("Married")})
      (ite (= ${e.attr(cp, "gender", p)} ${e.enum("Female")}) ${e.not_empty(cp, p, ["husband"])} ${e.not_empty(cp, p, ["wife"])})
    )`),

    // (re.range "A" "Z")
    // (re.* (re.range "a" "z"))

    e.forall_instances(cp, (p) => {
      const name = `(content ${e.attr(cp, "name", p)})`
      return `(str.in_re ${name} (re.++ (re.range "A" "Z") (re.* (re.range "a" "z"))))`
    })
  )

  return e
}

export default gen

