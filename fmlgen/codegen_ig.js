import {mk_options} from "./utils.js";
import {models, solver_cvc5_fmf, solver_z3} from "./catalogue.js";
import fs from "fs";

const id_cls = {
  cw: "worker",
  cs: "person",
  ehr: "department",
  percom: "job",
  transport: "train",
  bart: "train",
  rl_c: "customer"
}

const range_igk = [10, 25, 50]
const rk = 5
const sh_b = []
const sh_u = []
for (let k of range_igk) {
  const sfx = `_ig${k}`
  for (let [id, cls] of Object.entries(id_cls)) {
    const opts = mk_options(true, false, rk)
    opts.ig_bound = k
    opts.ig_class = cls
    opts.filename_suffix = sfx
    const [_, bg, ug] = models[id]
    const be = bg(opts)
    const fb = be.filename()
    const fml = fb + ".smt2"
    be.generate_file("gen/" + fml)
    const fbl = "ig_bounded.log"
    sh_b.push(
      `echo ":model:${fml}:${id}:${k}:${be.total_bound()}" >> ${fbl}`,
      `${solver_z3.exec(fml)} &>> ${fbl}`,
      `echo ":done:${fb}" >> ${fbl}`,
      `echo "done ${fb}"`,
    )

    if (ug) {
      const ue = ug(opts)
      const fu = ue.filename()
      const fml = fu + ".smt2"
      ue.generate_file("gen/" + fml)
      const ful = "ig_unbounded.log"
      sh_u.push(
        `echo ":model:${fml}:${id}:${k}:${ue.total_bound()}" >> ${ful}`,
        `${solver_cvc5_fmf.exec(fml)} &>> ${ful}`,
        `echo ":done:${fu}" >> ${ful}`,
        `echo "done ${fu}"`,
      )
    }
  }
}

fs.writeFileSync("gen/igb.sh", sh_b.join("\n"), "utf8")
fs.writeFileSync("gen/igu.sh", sh_u.join("\n"), "utf8")
