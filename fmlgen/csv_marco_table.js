import fs from "fs";
import {groups, models, numeric_parse, TIMEOUT_S, unsat} from "./catalogue.js";
import path from "path";
import {lst, mk_options} from "./utils.js";

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

const r = s => {
  const v = Math.round((parseFloat(s) + Number.EPSILON) * 100) / 100
  return v >= 1 ? Math.round(v) : v
}
const lines = fs
  .readFileSync("gen/marco.log", "utf8")
  .split("\n")
  .map(it => it.trim())
  .filter(it => it)

const results_agg = {}

let curr_id = null
let curr_mss0 = -1
let curr_mus0 = -1
let curr_time = -1
let curr_cnt_mus = 0
let curr_cnt_mss = 0
let curr_to = false
let curr_mo = false


for (let line of lines) {
  if (line.startsWith(":model")) {
    const [_, _conf, mode, _K, _inv] = line.slice(1).split(":")
    const id = Object.entries(id_filename).find(([_, files]) => files.some(f => _conf.startsWith(f)))[0]
    curr_id = id
    // curr_K = parseInt(_K)
  }

  if (line.startsWith("U ") || line.startsWith("S ")) {
    const [kind, ts] = line.split(" ")
    const t = r(ts)
    if (kind === "U") {
      if (curr_mus0 === -1) {
        curr_mus0 = t
      }
      curr_cnt_mus += 1
    } else {
      if (curr_mss0 === -1) {
        curr_mss0 = t
      }
      curr_cnt_mss += 1
    }
  }

  if (line.startsWith("total") && !curr_to) {
    curr_time = r(line.match(/([\d+\.]+)/)[0])
  }

  if (line.startsWith("Time limit")) {
    curr_time = -1
    curr_to = true
  }

  if (line.startsWith("Interrupted.")) {
    curr_mo = true
  }

  if (line.startsWith(":done")) {
    if (curr_id == null) {
      throw new Error(`Unknown model id ${curr_time}`)
    }
    if (!results_agg[curr_id]) {
      results_agg[curr_id] = {}
    }
    const [_, _2, filename] = line.split(":")
    const sfx = lst(filename.split("_"))
    results_agg[curr_id][sfx] = {
      mus: curr_cnt_mus,
      mus0: curr_mus0,
      mss: curr_cnt_mss,
      mss0: curr_mss0,
      time: curr_time,
      to: curr_to,
      mo: curr_mo
    }
    curr_id = null
    curr_mss0 = -1
    curr_mus0 = -1
    curr_time = -1
    curr_cnt_mus = 0
    curr_cnt_mss = 0
    curr_to = false
    curr_mo = false
  }
}

const modes = [
  "6", "12", "unbounded"
]


const tb = [
  ["model", ...modes.map(m => [`${m}-#MUS`, `${m}-MUS0`, `${m}-#MSS`, `${m}-MSS0`, `${m}-TIME`])].join(",")
]

for (let i = 0; i < groups.length; i++) {
  const ids = groups[i].filter(id => unsat.includes(id))
  const g = String.fromCharCode(i + 65)
  tb.push(`Group ${g}`)
  for (let j = 0; j < ids.length; j++) {
    const id = ids[j]
    const data = modes.map(m => {
      const {mus, mus0, mss, mss0, time, to, mo} = results_agg[id][m]
      return [
        mus,
        mus0 === -1 ? to ? "TO" : mo ? "MO" : "E" : mus0,
        mss,
        mss0 === -1 ? to ? "TO" : mo ? "MO" : "E" : mss0,
        to ? "TO" : mo ? "MO" : time
      ]
    }).flat()
    tb.push([
      id,
      ...data
    ].join(","))
  }
}
fs.writeFileSync("step2.csv", tb.join("\n"), "utf8")
console.log("generated")