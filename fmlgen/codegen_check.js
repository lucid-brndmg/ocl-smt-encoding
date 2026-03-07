import {models, solver_cvc5, solver_cvc5_fmf, solver_z3} from "./catalogue.js";
import path from "path";
import fs from "fs";
import {mk_options} from "./utils.js";

const [
  _1, _2,
  id,
  // sat | unsat
  _ssat,
  // us | ul | b | bc
  _mode,
  // k
  sk
] = process.argv

const [name, bg, ug] = models[id]
const ssat = _ssat.trim().toLowerCase()
const mode = _mode.toLowerCase().trim()
const sat = ssat === "sat"
const k = parseInt(sk) || 0

const gen = mode.toLowerCase().startsWith("u") ? ug : bg
if (!gen || mode.startsWith("b") && !k) {
  throw new Error(`Unsupported ${name} ${mode} ${k}`)
}

console.log("codegen", name, sat, mode)

const options = mk_options(sat, mode.includes("c"), k)

if (mode.includes("l")) {
  options.unbounded_multiplicity_mode = "loose"
} else if (mode.includes("s")) {
  options.unbounded_multiplicity_mode = "strict"
} else if (mode.includes("n")) {
  options.unbounded_multiplicity_mode = "none"
}

const e = gen(options)
const K = e.total_bound()

const profile_id = mode.startsWith("b") ? `${mode}${k}` : mode

const name_base = e.filename()

const solvers = [
  solver_z3,
]

if (mode.startsWith("u")) {
  solvers.push(solver_cvc5_fmf)
}
if (mode.startsWith("b")) {
  solvers.push(solver_cvc5)
}

// const solvers = mode === "u" ? solvers_u : solvers_b


const pfx = "gen/"
const file_fml = `${name_base}.smt2`
const pf_fml = path.join(pfx, file_fml)

e.generate_file(pf_fml)
console.log("! generated", pf_fml)

for (let solver of solvers) {
  const file_log = `${solver.name}_${profile_id}_${_ssat}.log`
  const file_sh = `${solver.name}_${profile_id}_${_ssat}.sh`
  const pf_sh = path.join(pfx, file_sh)
  const sh = [
    `echo ":model:${name_base}:${mode}:${K}:${e.assertions.length}" >> ${file_log}`,
    `${solver.exec(file_fml)} &>> ${file_log}`,
    `echo ":done:${name_base}" >> ${file_log}`,
    `echo "done ${name_base}"`,
    ""
  ]
  fs.appendFileSync(pf_sh, sh.join("\n"), "utf8")
}