import bg_ae_dep from "./tmpl_ae_dep.js";
import bg_am from "./tmpl_am.js";
import bg_bart from "./tmpl_bart.js";
import bg_car from "./tmpl_car.js";
import bg_car_rental from "./tmpl_car_rental.js";
import bg_cs from "./tmpl_cs.js"
import bg_cw from "./tmpl_company_worker.js"
import bg_dblp from "./tmpl_dblp.js"
import bg_ds from "./tmpl_ds.js"
import bg_ehr_a from "./tmpl_ehr_a.js";
import bg_ex from "./tmpl_ex.js";
import bg_oai from "./tmpl_oai.js"
import bg_percom from "./tmpl_percom.js";
import bg_pr from "./tmpl_pr.js";
import bg_rl_a from "./tmpl_rl_book.js";
import bg_rl_b from "./tmpl_rl_ecl.js";
import bg_rl_c from "./tmpl_rl_mini.js";
import bg_student from "./tmpl_student.js";
import bg_train from "./tmpl_train.js";
import bg_transport from "./tmpl_transport.js"

import ug_ae_dep from "./ub_ae_dep.js"
import ug_am from "./ub_am.js"
import ug_car from "./ub_car.js"
import ug_car_rental from "./ub_car_rental.js"
import ug_cw from "./ub_company_worker.js"
import ug_cs from "./ub_cs.js"
import ug_dblp from "./ub_dblp.js"
import ug_ds from "./ub_ds.js"
import ug_ehr_a from "./ub_ehr_a.js"
import ug_percom from "./ub_percom.js"
import ug_pr from "./ub_pr.js"
import ug_rl_a from "./ub_rl_book.js"
import ug_rl_b from "./ub_rl_eclipse.js"
import ug_rl_c from "./ub_rl_mini.js"
import ug_student from "./ub_student.js"
import ug_transport from "./ub_transport.js"


export const models = {
  aed: ["AE Department", bg_ae_dep, ug_ae_dep],
  am: ["Atom Molecule", bg_am,  ug_am],
  bart: ["BART", bg_bart],
  cd: ["Car Dealer", bg_car, ug_car],
  cr: ["Car Rental", bg_car_rental, ug_car_rental],
  cw: ["Company Worker", bg_cw, ug_cw],
  cs: ["Civil Status", bg_cs, ug_cs],
  dblp: ["DBLP", bg_dblp, ug_dblp],
  ds: ["Disjoint Subclass", bg_ds, ug_ds],
  ehr: ["EHR", bg_ehr_a, ug_ehr_a],
  ex: ["Ex", bg_ex],
  oai: ["Object Integers", bg_oai],
  percom: ["Percom", bg_percom, ug_percom],
  pr: ["Paper Researcher", bg_pr, ug_pr],
  rl_a: ["Royal \\& Loyal A", bg_rl_a, ug_rl_a],
  rl_b: ["Royal \\& Loyal B", bg_rl_b, ug_rl_b],
  rl_c: ["Royal \\& Loyal C", bg_rl_c, ug_rl_c],
  student: ["Student", bg_student, ug_student],
  train: ["Train", bg_train],
  transport: ["Transport", bg_transport, ug_transport]
}

export const groups = [
  // A
  ["am", "cd", "cw", "cs", "ds", "ex", "pr", "student"],
  // B
  ["aed", "cr", "dblp", "ehr", "oai", "percom", "train", "transport"],
  // C
  ["bart", "rl_a", "rl_b", "rl_c"]
]

export const unbounded_compatible = [
  "cd", "dblp", "percom", "transport",
  "rl_a", "rl_b", "rl_c"
]

export const unsat = [
  "am", "cr", "ehr", "pr", "rl_a", "rl_b", "rl_c", "student",
  "ds", "transport"
]
export const TIMEOUT_S = 3600

const MEM = "16G"

export const solver_z3 = {
  name: "z3",
  exec: file => `systemd-run --scope -p MemoryMax=${MEM} --user z3 ${file} -st -T:${TIMEOUT_S}`,
  b: true,
  u: true,
}

export const solver_cvc5 = {
  name: "cvc5",
  exec: file => `systemd-run --scope -p MemoryMax=${MEM} --user cvc5 ${file} --stats --tlimit ${TIMEOUT_S * 1000} --err stdout`,
  b: true
}

export const solver_cvc5_mbqi = {
  name: "cvc5-mbqi",
  exec: file => `systemd-run --scope -p MemoryMax=${MEM} --user cvc5 ${file} --mbqi --stats --tlimit ${TIMEOUT_S * 1000} --err stdout`,
  u: true
}


export const solver_cvc5_fmf = {
  name: "cvc5-fmf",
  exec: file => `systemd-run --scope -p MemoryMax=${MEM} --user cvc5 ${file} --finite-model-find --stats --tlimit ${TIMEOUT_S * 1000} --err stdout`,
  u: true
}

export const numeric_parse = line => line.match(/([\d+\.]+)/)[0]