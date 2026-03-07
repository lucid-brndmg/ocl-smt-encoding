import {groups, models, unbounded_compatible, unsat} from "./catalogue.js";
import {mk_options} from "./utils.js";

const th = [
  // "Grp.",
  "Model",
  "Cls.",
  "Atr.",
  "Asc.",
  "Gen.",
  "Inv.",
  "Ty.",
  "Ft.",
  "Sat.",
  "Ub.", // check, check*, cross
]

const tb = [
]

const lx_cline = `\\cline{2-${th.length}}`
const lx_grp = (x, n) => `\\multirow{${n}}{*}{${x}}`
const lx_yes = `\\checkmark`
const lx_no = `$\\times$`
const lx_bf = x => `\\textbf{${x}}`
const lx_hline = "\\hline"
const lx_mc = (n, x, align = "c") => `\\multicolumn{${n}}{${align}}{${x}}`

const unique = ["bart", "rl_a", "rl_b", "rl_c", "oai", "transport"]

for (let i = 0; i < groups.length; i++) {
  const ids = groups[i]
  const group_id = String.fromCharCode(i + 65)
  tb.push(lx_mc(th.length, lx_bf(`Group ${group_id}`)) + "\\\\ \\hline")
  for (let j = 0; j < ids.length; j++) {
    const id = ids[j]
    const [_name, gen, u] = models[id]
    const name = `${unique.includes(id) ? "*" : ""}${_name}${_name.includes(" ") ? ` ($${id.toUpperCase()}$)` : ""}`
    const e = gen(mk_options(false, false, 6))
    const {inv, inh, assoc, attr, classes, feat} = e.model_stats()
    const row = [
      // j === 0 ? lx_grp(group_id, ids.length) : "~", // group_id,
      name,
      classes,
      attr,
      assoc,
      inh,
      inv,
      Object.keys(feat).filter(k => ["r", "s", "i", "dt", "oc"].includes(k) && feat[k]).map(it => it.toUpperCase()).join(" "),
      Object.keys(feat).filter(k => ["ac", "im", "an", "cl"].includes(k) && feat[k]).map(it => it.toUpperCase()).join(" "),
      unsat.includes(id) ? "~" : lx_yes,
      unbounded_compatible.includes(id) ? `${lx_yes}*` : u ? lx_yes : `${lx_no}`
    ]

    // const s = `${row.join(" & ")}\\\\ ${j === ids.length - 1 ? lx_hline : lx_cline}`

    const s = `${row.join(" & ")}\\\\ ${lx_hline}`

    tb.push(s)
  }


}

console.log(th.map(() => `l`).join(""))

console.log(th.map(it => lx_bf(it)).join(" & "))

console.log(tb.join("\n"))