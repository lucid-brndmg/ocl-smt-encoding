import {ModelEnv, pb_eq, pb_singleton} from "./index.js";
import fs from "fs";
import path from "path";
import {gen_fml} from "./utils.js"
import {UnboundedEnv} from "./unbounded.js";

const gen = (opts) => {
  const sat = opts.sat
  const uml = {
    name: `ehr_a`,
    // bound: k,
    logic: "SLIA",

    classes: {
      doctor: {
        _extends: ["professional"],
        license: "NullableString",
        status: "NullableString"
      },
      department: {
        name: "NullableString",
        location: "NullableString"
      },
      medical_center: {
        name: "NullableString",
        address: "NullableString",
        zip_code: "NullableString",
        city: "NullableString",
        country: "NullableString",
        // director: "nullable:director"
      },
      director: {
        _extends: ["professional"]
      },
      nurse: {
        _extends: ["professional"],
        license: "NullableString",
      },
      professional: {
        login: "NullableString",
        password: "NullableString",
        name: "NullableString",
        surname: "NullableString"
      },
      referral: {
        id: "NullableString"
      },
      patient: {
        id: "NullableString",
        // contact_info: "nullable:contact_info"
      },
      contact_info: {
        id: "NullableString",
        name: "NullableString",
        surname: "NullableString",
        year_of_birth: "Int",
        gender: "NullableString",
        address: "NullableString"
      }
    },
    assoc: [
      {
        is_unary: true,
        participants: [
          ["medical_center", "medical_center", 0, null, 1],
          ["director", "director", 0, null, 1]
        ]
      },

      {
        is_unary: true,
        participants: [
          ["patient", "patient", 0, null, 1],
          ["contact_info", "contact_info", 0, null, 1]
        ]
      },


      {
        participants: [
          ["doctor", "substituted_by", 0, null, 1],
          ["doctor", "substitutions", null, null, null]
        ]
      },
      {
        participants: [
          ["doctor", "doctors", null, null, null],
          ["department", "departments", null, null, null]
        ]
      },
      {
        participants: [
          ["department", "departments", null, null, null],
          ["nurse", "nurses", null, null, null]
        ]
      },
      {
        participants: [
          ["department", "departments", null, null, null],
          ["medical_center", "belongs_to", 0, null, 1]
        ]
      },
      {
        participants: [
          ["medical_center", "works_in", null, null, null],
          ["professional", "employees", null, null, null]
        ]
      },
      {
        participants: [
          ["referral", "referrals_out", null, null, null],
          ["doctor", "referred_by", 0, null, 1]
        ]
      },
      {
        participants: [
          ["referral", "referrals_in", null, null, null],
          ["doctor", "referring_to", 0, null, 1],
        ]
      },
      {
        participants: [
          ["referral", "referrals", null, null, null],
          ["patient", "patient", 0, null, 1]
        ]
      },
      {
        participants: [
          ["patient", "patients", null, null, null],
          ["doctor", "doctor", 0, null, 1]
        ]
      },
      {
        participants: [
          ["patient", "patients", null, null, null],
          ["department", "department", 0, null, 1]
        ]
      }
    ]
  }

  const cdoc = "doctor"
  const cdept = "department"
  const cmc = "medical_center"
  const cn = "nurse"
  const cprof = "professional"
  const cref = "referral"
  const cpat = "patient"



  const e = new UnboundedEnv(uml, opts)
  const mksn = e.mk_nil("NullableString")
  const mks = e.mk("NullableString")


  e.assert_context(
    cmc,
    e.forall_instances(cmc, (mc) => `(and
    (distinct ${e.attr(cmc, "name", mc)} ${mksn})
    (distinct ${e.attr(cmc, "city", mc)} ${mksn})
    (distinct ${e.attr(cmc, "country", mc)} ${mksn})
    ${e.not_empty(cmc, mc, ["director"])}
  )`)
  )
  e.assert_context(
    cdept,
    e.forall_instances(cdept, (d) => `(distinct ${e.attr(cdept, "name", d)} ${mksn})`)
  )

  e.assert_context(
    cprof,
    e.forall_instances(cprof, (p) => `(and
    (distinct ${e.attr(cprof, "name", p)} ${mksn})
    (distinct ${e.attr(cprof, "surname", p)} ${mksn})
    (distinct ${e.attr(cprof, "login", p)} ${mksn})
    (distinct ${e.attr(cprof, "password", p)} ${mksn})
  )`)
  )

  e.assert_context(
    cpat,
    e.forall_instances(cpat, (p) => e.not_empty(cpat, p, ["contact_info"]))
  )

  e.assert_context(
    cn,
    e.forall_instances(cdept, (n) => `(distinct ${e.attr(cn, "license", n)} ${mksn})`)
  )

  e.assert_context(
    cmc,
    e.forall_instances(cmc, (m) => e.assoc_each_distinct(cmc, m, [], (m1, m2) =>
      // "when considering together" means ...
      `(or
      (distinct ${e.attr(cmc, "address", m1)} ${e.attr(cmc, "address", m2)})
      (distinct ${e.attr(cmc, "zip_code", m1)} ${e.attr(cmc, "zip_code", m2)})
      (distinct ${e.attr(cmc, "city", m1)} ${e.attr(cmc, "city", m2)})
      (distinct ${e.attr(cmc, "country", m1)} ${e.attr(cmc, "country", m2)})
    )`
    ))
  )
  e.assert_context(
    cprof,
    e.forall_instances(cprof, (p) => e.assoc_each_distinct(cprof, p, [], (p1, p2) =>
      `(distinct ${e.attr(cprof, "login", p1)} ${e.attr(cprof, "login", p2)})`
    ))
  )

  e.assert_context(
    cdoc,
    e.forall_instances(cdoc, (p) => e.assoc_each_distinct(cdoc, p, [], (p1, p2) =>
      `(distinct ${e.attr(cdoc, "license", p1)} ${e.attr(cdoc, "license", p2)})`
    ))
  )
  e.assert_context(
    cn,
    e.forall_instances(cn, (p) => e.assoc_each_distinct(cn, p, [], (p1, p2) =>
      `(distinct ${e.attr(cn, "license", p1)} ${e.attr(cn, "license", p2)})`
    ))
  )
  e.assert_context(
    cref,
    e.forall_instances(cref, (m) => e.assoc_each_distinct(cref, m, [], (m1, m2) =>
      // pb_eq(e.assoc_vec(cref, m1, ["patient"]), e.assoc_vec(cref, m2, ["patient"]))
      `(or
      (not ${e.path_eq(cref, m1, ["patient"], cref, m2, ["patient"])})
      (not ${e.path_eq(cref, m1, ["referring_to"], cref, m2, ["referring_to"])})
      (not ${e.path_eq(cref, m1, ["referred_by"], cref, m2, ["referred_by"])})
    )`
    ))
  )

  e.assert_context(
    cmc,
    e.forall_instances(cmc, (m) => e.not_empty(cmc, m, ["employees"])),
  )
  e.assert_context(
    cdept,
    e.forall_instances(cdept, (m) => `(and
    ${e.not_empty(cdept, m, ["belongs_to"])}
    ${e.not_empty(cdept, m, ["doctors"])}
    ${e.not_empty(cdept, m, ["nurses"])}
  )`),
  )

  e.assert_context(
    cref,
    e.forall_instances(cref, (m) => `(and
    ${e.not_empty(cref, m, ["patient"])}
    ${e.not_empty(cref, m, ["referred_by"])}
  )`),
  )
  e.assert_context(
    cpat,
    e.forall_instances(cpat, (m) => `(and
    ${e.not_empty(cpat, m, ["doctor"])}
    ${e.not_empty(cpat, m, ["department"])}
  )`),
  )
  e.assert_context(
    cpat,
    e.forall_instances(cpat, p => e.assoc_path_includes_all(cpat, p, ["doctor", "departments"], ["department"])),
    // e.forall_instances(cpat, (p) => e.exists_navigate(cpat, p, ["doctor", "departments"], ([p, d, dep]) => {
    //   // p.doctor.departments→exists(d|d=p.department)
    //   return e.exists_navigate(cpat, p, ["department"], (_, dep2) => `(and (= 1131 1131) (= ${dep} ${dep2}))`)
    //   // const a = e.assoc_vec(cpat, p, ["department"])
    //   // return pb_eq(a, pb_singleton(a.length, dep))
    // }))
  )

  e.assert_context(
    cprof,
    e.forall_instances(cprof, (p) => `(distinct ${e.attr(cprof, "password", p)} (${mks} ""))`),
    e.forall_instances(cprof, (p) => `(distinct ${e.attr(cprof, "login", p)} (${mks} ""))`)
  )

  e.assert_context(
    cdoc,
    e.forall_instances(cdoc, (doc) => {
      // const v_subst = e.assoc_vec(cdoc, doc, ["substituted_by"])
      // ${pb_eq(v_subst, pb_singleton(v_subst.length, doc))}
      return `(=>
    (= (${mks} "unavailable") ${e.attr(cdoc, "status", doc)})
    (not (or
      ${e.is_empty(cdoc, doc, ["substituted_by"])}
      ${e.exists_navigate(cdoc, doc, ["substituted_by"], (_, ds) => `(= ${ds} ${doc})`)}
    ))
  )`
     }),
    e.forall_instances(cdoc, (doc) => `(=>
    (= (${mks} "available") ${e.attr(cdoc, "status", doc)})
    ${e.is_empty(cdoc, doc, ["substituted_by"])}
  )`),
    e.forall_instances(cdoc, (doc) => `(=>
    ${e.is_empty(cdoc, doc, ["substitutions"])}
    (= (${mks} "available") ${e.attr(cdoc, "status", doc)})
  )`),

  )

  e.assert_context(
    cref,
    e.forall_instances(cref, (r) => `(=>
    (not (and
      ${e.is_empty(cref, r, ["patient"])}
      ${e.is_empty(cref, r, ["referring_to"])}
    ))

    (not ${e.path_eq(
      cref, r, ["referring_to"],
      cref, r, ["referred_by"]
    )})
  )`)
  )

  if (!sat) {
    e.assert_context(
      cdoc,
      e.exists_instances(cdoc, (d) => `(and
    (= (${mks} "unavailable") ${e.attr(cdoc, "status", d)})
    ${e.forall_instances(cdoc, (d2) => `(= ${d2} ${d})`)}
  )`)
    )
  }

  return e
}

export default gen

