import fs from "fs";
import {groups, numeric_parse, TIMEOUT_S, unsat} from "./catalogue.js";

const result_agg = {}

const pfs = ["ig_bounded", "ig_unbounded"]
const rb = /L\d+\s+\(\)\s+Int/g

const round = t => t >= 1 ? Math.round(t) : t.toFixed(2)

for (let pf of pfs) {
  const lines = fs
    .readFileSync(`gen/${pf}.log`, "utf8")
    .split("\n")
    .map(it => it.trim())
    .filter(it => it)

  const is_u = pf === "ig_unbounded"

  let curr_id = null
  let curr_to = false
  let curr_status = "undefined"
  let curr_time = -1
  let curr_profile = null
  let add_next = false
  let inst = 0

  for (let line of lines) {
    if (line.startsWith(":model")) {
      const [_1, fml, id, igk] = line.slice(1).split(":")
      curr_id = id
      curr_profile = `${igk}${is_u ? "u" : "b"}`
    }

    if (!curr_to && (line.startsWith(":time") || line.startsWith("global::totalTime"))) {
      curr_time = round(parseFloat(numeric_parse(line)))
      if (is_u) {
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

    if (is_u) {
      if (line.includes("cardinality of Classifier")) {
        inst = parseInt(numeric_parse(line)) - 1 // null is a Classifier
      }
    } else {
      if (add_next) {
        inst += parseInt(numeric_parse(line))
        add_next = false
      }
      if (rb.test(line)) {
        add_next = true
      }

    }

    if (line.startsWith(":done")) {
      if (curr_id == null) {
        throw new Error(`Unknown model id ${curr_status} ${curr_time}`)
      }

      if (!result_agg[curr_id]) {
        result_agg[curr_id] = {}
      }

      result_agg[curr_id][curr_profile] = {
        time: curr_time,
        status: curr_status,
        obj: inst
      }

      curr_id = null
      curr_status = "undefined"
      curr_time = -1
      curr_to = false
      curr_profile = null
      inst = 0
    }
  }
}


const id_cls = {
  // cd: "car",
  cw: "worker",
  cs: "person",
  ehr: "department",
  percom: "job",
  transport: "train",
  bart: "train",
  rl_c: "customer"
}



const modes = [
  "10b", "10u",
  "25b", "25u",
  "50b", "50u",
]


const tb = [
  ["id", "class", ...modes].join(",")
]

for (let i = 0; i < groups.length; i++) {
  const ids = groups[i].filter(id => id_cls[id])
  const g = String.fromCharCode(i + 65)
  tb.push(`Group ${g}`)
  for (let j = 0; j < ids.length; j++) {
    const id = ids[j]
    const data = modes.map(m => {
      if (!result_agg[id][m]) {
        return "N/A"
      }
      const {status, time, obj} = result_agg[id][m]
      return status === "timeout" ? "TO" : time === -1 ? "MO" : time
    })
    tb.push([
      `${id.toUpperCase()}`,
      id_cls[id],
      ...data
    ].join(" , "))
  }
}

fs.writeFileSync("step3.csv", tb.join("\n"), "utf8")
console.log("generated")