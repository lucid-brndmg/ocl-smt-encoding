import fs from "fs";
import {groups, models, numeric_parse, TIMEOUT_S, unsat} from "./catalogue.js";
import path from "path";
import {mk_options} from "./utils.js";

const id_filename = {
  "am": ["am"],
  "cd": ["car_dealer"],
  "cw": ["company_worker"],
  "cs": ["cs"],
  "ds": ["ds"],
  "ex": ["ex"],
  "pr": ["pr_sat", "pr_unsat"],
  "student": ["student"],
  "aed": ["ae_dep"],
  "cr": ["car_rental"],
  "dblp": ["dblp"],
  "ehr": ["ehr_a"],
  "oai": ["oai"],
  "percom": ["percom"],
  "train": ["train"],
  "transport": ["transport"],
  "bart": ["bart_model_nodiv0"],
  "rl_a": ["rl_a"],
  "rl_b": ["rl_b"],
  "rl_c": ["rl_c"]
}

const round = t => t >= 1 ? Math.round(t) : t.toFixed(2)


const parse_log = filename => {
  const results = {}
  const lines = fs.readFileSync(path.join("gen", filename), "utf8").split("\n")
  let curr_id = null
  let curr_status = "undefined"
  let curr_time = -1
  let curr_to = false
  // let curr_K = 0
  for (let _line of lines) {
    const line = _line.trim()
    if (line.startsWith(":model")) {
      const [_, _conf, mode, _K, _inv] = line.slice(1).split(":")
      const id = Object.entries(id_filename).find(([_, files]) => files.some(f => _conf.startsWith(f)))[0]
      curr_id = id
      // curr_K = parseInt(_K)
    }
    if (!curr_to && (line.startsWith(":time") || line.startsWith("global::totalTime"))) {
      curr_time = round(parseFloat(numeric_parse(line)))
      if (filename.startsWith("cvc5")) {
        curr_time = round(curr_time / 1000)
      }
      if (curr_time > TIMEOUT_S) {
        curr_time = -1
      }
    }
    if (["sat", "unsat", "unknown", "timeout"].includes(line)) {
      curr_status = line
    }
    if (line === "timeout" || line === "cvc5 interrupted by timeout.") {
      curr_to = true
    }
    if (line.startsWith(":done")) {
      if (curr_id == null) {
        throw new Error(`Unknown model id ${curr_status} ${curr_time}`)
      }

      results[curr_id] = {
        time: curr_time,
        status: curr_status,
      }

      curr_id = null
      curr_status = "undefined"
      curr_time = -1
      curr_to = false
    }
  }

  return results
}

const results_agg = {}

const logs = fs.readdirSync("gen", "utf8")
  .filter(f => f.endsWith(".log") && !f.startsWith("marco")).sort()
const profiles = logs.map(f => f.slice(0, f.length - ".log".length))

const extract_data = (id, profiles) => {
  const cols = []
  const data = results_agg[id]
  for (let pid of profiles) {
    if (!data[pid]) {
      cols.push("-")
    } else {
      const {time, status} = data[pid]
      //  const t = data[pid]?.time ?? "-"
      cols.push(time === -1 ? status === "timeout" ? "TO" : "MO" : time)
      // cols.push(t)
    }
  }
  return cols
}

for (let file of logs) {
  const profile = file.slice(0, file.length - ".log".length)
  const results = parse_log(file)
  for (let [id, r] of Object.entries(results)) {
    if (!results_agg[id]) {
      results_agg[id] = {}
    }
    results_agg[id][profile] = r
  }
}

let simplified = true

const th = [
  "ID",
  ...(simplified ? profiles :  profiles.map(f => [f.slice(0, f.length - ".log".length), "T"]).flat())
].join(",")
const csv = [th]

for (let [id, profiles] of Object.entries(results_agg)) {
  csv.push([
    id,
    // ...Object.values(profiles).map(({time, status}) => [status, time]).flat(),
    ...logs.map(f => {
      const pid = f.slice(0, f.length - ".log".length)
      const {status, time} = profiles[pid] ?? {status: "?", time: "-"}
      if (simplified) {
        return time // ["sat", "unsat"].includes(status) ? time : "TO"
      }
      return [status, time]
    }).flat()
  ].join(","))
}
// fs.writeFileSync("gen/check_data.csv", csv.join("\n"), "utf8")
// console.log("fin")


const sat_bounded_bulks = [
  "z3_b6_sat",
  "cvc5_b6_sat",

  "z3_b12_sat",
  "cvc5_b12_sat",

  "z3_b24_sat",
  "cvc5_b24_sat",
]

const sat_unbounded_bulks = [
  "z3_us_sat",
  "cvc5-fmf_us_sat"
]

const unsat_bounded_bulks = [
  "z3_b6_unsat",
  "cvc5_b6_unsat",

  "z3_b12_unsat",
  "cvc5_b12_unsat",

  "z3_b24_unsat",
  "cvc5_b24_unsat",
]

const unsat_unbounded_bulks = [
  "z3_us_unsat",
  "cvc5-fmf_us_unsat"
]

const tb1 = [
  `model,inv-bounded,${sat_bounded_bulks.concat(["inv-unbounded"]).concat(sat_unbounded_bulks).join(",")}`
]

for (let i = 0; i < groups.length; i++) {
  const ids = groups[i]
  const g = String.fromCharCode(i + 65)
  tb1.push(`Group ${g}`)
  for (let j = 0; j < ids.length; j++) {
    const id = ids[j]
    const [_, bg, ug] = models[id]
    // const data_u = extract_data(id, sat_unbounded_bulks)
    const opts_b = mk_options(true, false, 3)
    const opts_u = mk_options(true, true, 3)
    // const time_b = extract_data(id, sat_bounded_bulks)
    // const time_u = extract_data(id, sat_unbounded_bulks)

    // const min_glob = Math.min(...[...time_b, ...time_u].filter(t => t !== -1 && !isNaN(t)))
    // console.log(min_glob)
    const b_inv = bg(opts_b).model_stats().inv
    const data_b = [b_inv].concat(extract_data(id, sat_bounded_bulks))
    const data_u = ug
      ? [bg(opts_u).model_stats().inv, ...extract_data(id, sat_unbounded_bulks)]
      : ["", "", ""]
    tb1.push([
      `${id}`,
      ...data_b,
      ...data_u
    ].join(" , "))
  }
}

fs.writeFileSync("step1_sat.csv", tb1.join("\n"), "utf8")

const tb2 = [
  `model,inv-bounded,${unsat_bounded_bulks.concat(["inv-unbounded"]).concat(unsat_unbounded_bulks).join(",")}`
]

for (let i = 0; i < groups.length; i++) {
  const ids = groups[i].filter(id => unsat.includes(id))
  const g = String.fromCharCode(i + 65)
  tb2.push(`Group ${g}`)
  for (let j = 0; j < ids.length; j++) {
    const id = ids[j]
    const [_, bg, ug] = models[id]
    // const data_u = extract_data(id, sat_unbounded_bulks)
    const opts_b = mk_options(false, false, 3)
    const opts_u = mk_options(false, true, 3)
    // const time_b = extract_data(id, sat_bounded_bulks)
    // const time_u = extract_data(id, sat_unbounded_bulks)

    // const min_glob = Math.min(...[...time_b, ...time_u].filter(t => t !== -1 && !isNaN(t)))
    // console.log(min_glob)
    const b_inv = bg(opts_b).model_stats().inv
    const data_b = [b_inv].concat(extract_data(id, unsat_bounded_bulks))
    const data_u = ug
      ? [bg(opts_u).model_stats().inv, ...extract_data(id, unsat_unbounded_bulks)]
      : ["", "", ""]
    tb2.push([
      `${id}`,
      ...data_b,
      ...data_u
    ].join(" , "))
  }
}

fs.writeFileSync("step1_unsat.csv", tb2.join("\n"), "utf8")
console.log("csv files generated")