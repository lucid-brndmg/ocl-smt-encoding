import {ModelEnv, pb_sum} from "./index.js";
import {gen_fml} from "./utils.js"

import fs from "fs";
import * as path from "path";

const gen = opts => {
  const uml = {
    logic: "LIA",
    name: "ae_dep",
    // bound: k,
    enums: {
      PatientStatus: ["PSExpectant", "PSImmediate", "PSDelayed", "PSMinor"],
      Gender: ["GMale", "GFemale"],
      TriageSpeciality: ["TRSDoctor", "TRSNurse", "TRSTechnician"],
      DocSpeciality: ["DSEmergency", "DSSurgery", "DSAnesthesiology", "DSOrthopedics", "DSNeurosurgery", "DSOphthamology", "DSNephrology", "DSRadiology"],
      TechSpeciality: ["TESDiagnosticRadiographer", "TESHealthcareAssistant", "TESParamedic"]
    },
    classes: {
      hospital: {
        name: "String",
        phone: "Int",
        address: "String"
      },
      departments: {
        name: "String",
        id: "String",
        loc: "String",
        phone: "String"
      },
      ae_department: {
        _extends: ["departments"],
        size: "Int",
        capacity: "Int"
      },
      people: {
        fname: "String",
        lname: "String",
        gender: "Gender",
        birthday: "String"
      },
      staff: {
        _extends: ["people"],
        id: "Int",
        triagestaff: "Bool",
        address: "String"
      },
      patient: {
        _extends: ["people"],
        patient_no: "String",
        dateadmit: "String",
        timeadmit: "String",
        accident: "Bool",
        status: "PatientStatus",
        assigned: "Bool"
      },
      porter: {
        _extends: ["staff"]
      },
      receptionist: {
        _extends: ["staff"]
      },
      triage_staff: {
        _extends: ["staff"],
        triageno: "Int",
        kind: "TriageSpeciality"
      },
      doctor: {
        _extends: ["triage_staff"],
        pager: "Integer",
        specialization: "DocSpeciality",
        notes: "String"
      },
      nurse: {
        _extends: ["triage_staff"],
        nursespecialty: "String",
        pager: "Int"
      },
      technicans: {
        _extends: ["triage_staff"],
        techspecialty: "TechSpeciality",
        pager: "Int"
      }
    },

    assoc: [
      {
        participants: [
          ["triage_staff", "triage_staff", null, null, null],
          ["patient", "patient", null, null, null]
        ],
      },
      {
        participants: [
          ["hospital", "hospital", null, null, null],
          ["departments", "departments", null, null, null]
        ],
        is_unary: true
      },
      {
        participants: [
          ["patient", "patient", null, null, null],
          ["ae_department", "ae_department", null, 1, null]
        ]
      },
      {
        participants: [
          ["ae_department", "ae_department", null, 1, null],
          ["staff", "staff", 1, null, null],
        ]
      }
    ]
  }
  const e = new ModelEnv(uml, opts)
  const cae = "ae_department"
  const cs = "staff"
  const cts = "triage_staff"
  const cp = "patient"

  e.assert_context(
    cae,
    e.forall_instances(cae, (ae) => `(and 
    (> ${e.attr(cae, "size", ae)} 0)
    (> ${e.attr(cae, "capacity", ae)} 0)
  )`),
    e.forall_instances(cae, (ae) => `(distinct
    0
    ${pb_sum(e.assoc_vec(cae, ae, ["staff"]))}
  )`),
    e.forall_instances(cae, (ae) => e.exists_navigate(cae, ae, ["staff"], ([ae, s]) => e.exists_cast(cs, s, "triage_staff", ts => e.exists_cast(cts, ts, "doctor")))),
  )

  e.assert_context(
    cs,
    e.forall_instances(cs, (s) => e.assoc_each_distinct(cs, s, [], (s1, s2) => `(distinct 
    ${e.attr(cs, "id", s1)}
    ${e.attr(cs, "id", s2)}    
  )`)),
    e.exists_instances(cs, (s) => e.attr(cs, "triagestaff", s)),

  )
  e.assert_context(
    cts,
    e.exists_instances(cts, (ts) => `(= ${e.attr(cts, "kind", ts)} ${e.enum("TRSDoctor")})`),
    e.exists_instances(cts, (ts) => `(= ${e.attr(cts, "kind", ts)} ${e.enum("TRSNurse")})`),
    e.exists_instances(cts, (ts) => `(= ${e.attr(cts, "kind", ts)} ${e.enum("TRSTechnician")})`),
  )
  e.assert_context(
    cp,
    e.forall_instances(cp, (p) => `(=> 
    (or (= ${e.attr(cp, "status", p)} ${e.enum("PSExpectant")}) (= ${e.attr(cp, "status", p)} ${e.enum("PSImmediate")}))
    
    ${e.attr(cp, "assigned", p)}
  )`),

    e.forall_instances(cp, (p) => `(distinct
    0
    ${pb_sum(e.assoc_vec(cp, p, ["triage_staff"]))}
  )`)
  )

  return e
}


export default gen