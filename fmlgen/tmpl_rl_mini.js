// RL(C)

import {b2i, ModelEnv, pb_fold} from "./index.js";
import fs from "fs";
import path from "path";
import {mk_options, rl_date_ops} from "./utils.js";
import {gen_fml} from "./utils.js"

const gen = opts => {
  const opt_conflict_free = opts.sat
  const uml = {
    name: "rl_c", // opt_conflict_free ? "rl_wm08_sat" : "rl_wm08_unsat",
    logic: "SLIA",
    tuples: {
      "Date": ["Int", "Int", "Int"]
    },
    enums: {
      "Color": ["ColorSilver", "ColorGold"],
    },

    classes: {
      loyalty_program: { name: "String" },
      customer: { name: "String", title: "String", is_male: "Bool", dob: "Date", age: "Int" },
      membership: {
        _assoc: {
          participants: [
            ["loyalty_program", "programs", null, null, null],
            ["customer", "participants", null, null, null]
          ]
        }
      },
      program_partner: {number_of_customers: "Int", name: "String"},
      service_level: { name: "String" },
      loyalty_account: { points: "Int", number: "Int" },
      customer_card: { valid: "Bool", valid_from: "Date", valid_thru: "Date", color: "Color", printed_name: "String" },
      service: { condition: "Bool", points_earned: "Int", points_burned: "Int", description: "String", service_nr: "Int" },
      transaction: { points: "Int", date: "Date", amount: "Real" },
      burning: { _extends: ["transaction"] },
      earning: { _extends: ["transaction"] },
    },
    assoc: [
      {
        participants: [
          ["loyalty_program", "programs", 1, null, null],
          ["program_partner", "partners", 1, null, null]
        ],
      },
      {
        participants: [
          ["program_partner", "partner", null, 1, null],
          ["service", "delivered_services", null, null, null]
        ]
      },
      {
        participants: [
          ["loyalty_program", "program", null, 1, null],
          ["service_level", "levels", 1, null, null, true]
        ]
      },
      {
        participants: [
          ["service_level", "level", null, 1, null],
          ["service", "available_services", null, null, null]
        ]
      },
      {
        participants: [
          ["service", "generated_by", null, 1, null],
          ["transaction", "transactions", null, null, null]
        ]
      },
      {
        participants: [
          ["service_level", "current_level", null, 1, null],
          ["membership", "membership", null, null, null]
        ]
      },
      {
        participants: [
          ["loyalty_account", "account", 0, null, 1],
          ["membership", "membership", null, 1, null]
        ]
      },
      {
        participants: [
          ["loyalty_account", "account", null, 1, null],
          ["transaction", "transactions", null, null, null]
        ]
      },
      {
        participants: [
          ["transaction", "transactions", null, null, null],
          ["customer_card", "card", null, 1, null]
        ]
      },
      {
        participants: [
          ["customer_card", "card", null, 1, null],
          ["membership", "membership", null, 1, null]
        ]
      },
      {
        participants: [
          ["customer_card", "cards", null, null, null],
          ["customer", "owner", null, 1, null]
        ]
      }
    ]
  }

  const clp = "loyalty_program"
  const cc = "customer"
  const ccc = "customer_card"
  const cmb = "membership"
  const cla = "loyalty_account"
  const cpp = "program_partner"
  const cs = "service"
  const csl = "service_level"
  const ct = "transaction"
  const cb = "burning"
  const ce = "earning"

  const e = new ModelEnv(uml, opts)


  const k_c = e.bound_of(cc)


  const v_date_now = rl_date_ops(e)

// e.options.aggregate_assertions = false
// e.options.core = true

  e.named("legal_age", e.forall_instances(cc, (c) => `(>= ${e.attr(cc, "age", c)} 18)`))

  e.named("sizes_agree", e.forall_instances(cc, (c) => `(=
    (+ ${e.assoc_vec(cc, c, ["programs"]).map(b2i).join(" ")})
    (+ ${e.assoc_filter_pb(e.assoc_vec(cc, c, ["cards"]), ccc, cc => e.attr(ccc, "valid", cc)).map(b2i).join(" ")})
  )`))

  e.named("male_title", e.forall_instances(cc, (c) => `(=>
  ${e.attr(cc, "is_male", c)}
  (= ${e.attr(cc, "title", c)} "Mr.")
)`))

  e.named("check_dates", e.forall_instances(ccc, (cc) => `(date_is_before ${e.attr(ccc, "valid_from", cc)} ${e.attr(ccc, "valid_thru", cc)})`))

  e.named("birth_date", e.forall_instances(ccc, (id_cc) => e.exists_navigate(ccc, id_cc, ["owner"], ([id_cc, c]) => `(date_is_before ${e.attr(cc, "dob", c)} ${v_date_now})`)))

  e.named("program_participation", e.forall_instances(ccc, cc => {
    const xs = e.assoc_vec(ccc, cc, ["owner", "programs"])
    return `(> (+ ${xs.map(b2i).join(" ")}) 0)`
  }))

  e.named("transaction_points", e.forall_instances(ccc, cc => {
    const xs = e.assoc_vec(ccc, cc, ["transactions"])
    return `(distinct 0 (+ ${e.assoc_filter_pb(xs, ct, t => `(> ${e.attr(ct, "points", t)} 100)`).map(b2i).join(" ")}))`
  }))

  e.named("know_service_level", e.forall_instances(cmb, mb => e.assoc_path_includes(cmb, mb, ["programs", "levels"], ["current_level"])))

  e.named("correct_card", e.forall_instances(cmb, (mb) => e.assoc_path_includes(cmb, mb, ["participants", "cards"], ["card"])))

  e.named("level_and_color", e.forall_instances(cmb, (mb) => `(and
    (=>
      ${e.exists_navigate(cmb, mb, ["current_level"], ([mb, lv]) => `(= ${e.attr(csl, "name", lv)} "Silver")`)}
      ${e.exists_navigate(cmb, mb, ["card"], ([mb, cc]) => `(= ${e.attr(ccc, "color", cc)} ${e.enum("ColorSilver")})` )}
    )

    (=>
      ${e.exists_navigate(cmb, mb, ["current_level"], ([mb, lv]) => `(= ${e.attr(csl, "name", lv)} "Gold")`)}
      ${e.exists_navigate(cmb, mb, ["card"], ([mb, cc]) => `(= ${e.attr(ccc, "color", cc)} ${e.enum("ColorGold")})` )}
    )
  )`))

  e.named("min_services", e.forall_instances(clp, (lp) => `(>=
    (+ ${e.assoc_vec(clp, lp, ["partners", "delivered_services"]).map(b2i).join(" ")})
    1
  )`))

  e.named("no_accounts", e.forall_instances(clp, (lp) => e.forall_navigate(clp, lp, ["partners", "delivered_services"], ([lp, pp, s]) => `(=>
    (and (= 0 ${e.attr(cs, "points_earned", s)}) (= 0 ${e.attr(cs, "points_burned", s)}))
    (= 0 (+ ${e.assoc_vec(clp, lp, ["membership", "account"]).map(b2i).join(" ")}))
  )`)))

  if (!opts.unbounded_compatible) {
    e.named("first_level", e.forall_instances(clp, (lp) => e.ord_assoc_at(clp, lp, "levels", 0, sl => `(= ${e.attr(csl, "name", sl)} "Silver")`)))
  }


  e.named("basic_level", e.forall_instances(clp, (lp) => e.exists_navigate(clp, lp, ["levels"], ([lp, sl]) => `(= ${e.attr(csl, "name", sl)} "basic")`)))

  if (!opts.unbounded_compatible) {
    e.named("max_participants", e.forall_instances(clp, (lp) => `(<
    (+ ${e.assoc_vec(clp, lp, ["participants"]).map(b2i).join(" ")})
    10000
  )`))
  }


  e.named("unique_account", e.forall_instances(clp, (lp) => e.assoc_each_distinct(clp, lp, ["membership", "account"], (a1, a2) => `(distinct
    ${e.attr(cla, "number", a1)}
    ${e.attr(cla, "number", a2)}
  )`)))

  e.named("unique_names", e.forall_instances(clp, (lp) => e.assoc_each_distinct(clp, lp, ["participants"], (c1, c2) => `(distinct
    ${e.attr(cc, "name", c1)}
    ${e.attr(cc, "name", c2)}
  )`)))

  e.named("max_age", e.forall_instances(clp, (lp) => e.forall_navigate(clp, lp, ["participants"], ([lp, c]) => `(<=
    ${e.attr(cc, "age", c)}
    70
  )`)))

// ctx LoyaltyProgram
// inv oneAccount: self.Membership.account−>one(number < 10,000)
  e.named("one_account", e.forall_instances(clp, (lp) => {
    const xs = e.assoc_vec(clp, lp, ["membership", "account"])
    // return `(= 1 (+ ${xs.map(b2i).join(" ")}))`

    const ys = e.assoc_filter_pb(xs, cla, la => `(< ${e.attr(cla, "number", la)} 10000)`)
    return `(= 1 (+ ${ys.map(b2i).join(" ")}))`
  }))

  if (!opts.unbounded_compatible) {
    e.named("nr_of_participants", e.forall_instances(cpp, (pp) => `(= ${e.attr(cpp, "number_of_customers", pp)} (+ ${pb_fold(e.assoc_vec(cpp, pp, ["programs", "participants"]), k_c).map(b2i).join(" ")}))`))
    e.named("total_points", e.forall_instances(cpp, (pp) => {
      const tx = e
        .iterate_navigate(cpp, pp, ["delivered_services", "transactions"], ([pp, s, tx], _, conj) => [tx, `(and ${conj.join(" ")} ${e.exists_cast(ct, tx, ce)})`], xs => xs)
        .map(([tx, conj]) => `(ite ${conj} ${e.attr(ct, "points", tx)} 0)`)

      return `(< (+ ${tx.join(" ")}) 10000)`
    }))
  }


  e.named("one_owner", e.forall_instances(cla, (la) => {
    const xs = e.assoc_vec(cla, la, ["transactions", "card", "owner"])
    return `(= 1 (+ ${pb_fold(xs, k_c).map(b2i).join(" ")}))`
  }))

  e.named("positive_points", e.forall_instances(cla, (la) => `(=>
    (> ${e.attr(cla, "points", la)} 0)
    ${e.exists_navigate(cla, la, ["transactions"], ([la, t]) => `(> ${e.attr(ct, "points", t)} 0)`)}
  )`))

  e.named("_500_points", e.forall_instances(cla, (la) => e.exists_navigate(cla, la, ["transactions"], ([la, t]) => `(= ${e.attr(ct, "points", t)} 500)`)))

  e.named("service_partner", e.forall_instances(csl, (sl) => e.assoc_path_includes_all(csl, sl, ["program", "partners"], ["available_services", "partner"])))

  if (!opt_conflict_free) {
    // this inv causes class account can not be instantiated
    // each account connects to 1 membership, but "membership have no account"
    // thus makes it impossible to instantiate LA class
    e.named("no_account", e.forall_instances(cmb, (mb) => `(= 0 (+ ${e.assoc_vec(cmb, mb, ["account"]).map(b2i).join(" ")}))`))
  }

  return e
}

// const opts = mk_options(true, false, 3)
// opts.ig_class = "customer"
// opts.ig_bound = 20
// gen_fml(gen(opts))

export default gen
