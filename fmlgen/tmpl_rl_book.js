// RL(A)

import {b2i, ModelEnv, pb_fold} from "./index.js";
import fs from "fs";
import path from "path";
import {mk_options, rl_date_ops} from "./utils.js";
import {gen_fml} from "./utils.js"

const gen = opts => {
  const opt_conflict_free = opts.sat
  const uml_book = {
    name: `rl_a`,
    logic: "SLIA",
    tuples: {
      "Date": ["Int", "Int", "Int"]
    },
    enums: {
      "Color": ["ColorSilver", "ColorGold"],
      "Gender": ["GenderMale", "GenderFemale"]
    },

    classes: {
      loyalty_program: { name: "String" },
      customer: {
        name: "String",
        title: "String",
        gender: "Gender",
        dob: "Date",
        age: "Int",
        // membership: "set:membership"
      },
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

      transaction_report: {
        // card: "nullable:customer_card"
        until: "Date",
        from: "Date"
      },
      transaction_report_line: {
        // transaction: "nullable:transaction"
      },

    },
    assoc: [
      // ---
      {
        participants: [
          ["loyalty_program", "programs", 1, null, null],
          ["program_partner", "partners", 1, null, null]
        ]
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
          ["service_level", "levels", 1, null, null, !opts.unbounded_compatible]
        ],
      },
      {
        participants: [
          ["service_level", "level", null, 1, null],
          ["service", "available_services", null, null, null]
        ],
      },
      {
        participants: [
          ["service_level", "current_level", null, 1, null],
          ["membership", "membership", null, null, null]
        ],
      },
      {
        participants: [
          ["customer_card", "card", null, 1, null],
          ["membership", "membership", null, 1, null]
        ],
      },

      {
        participants: [
          ["loyalty_account", "account", 0, null, 1],
          ["membership", "membership", null, 1, null]
        ],
      },

      {
        participants: [
          ["customer_card", "cards", null, null, null],
          ["customer", "owner", null, 1, null]
        ],
      },

      {
        participants: [
          ["service", "generated_by", null, 1, null],
          ["transaction", "transactions", null, null, null]
        ],
      },
      {
        participants: [
          ["loyalty_account", "account", null, 1, null],
          ["transaction", "transactions", null, null, null]
        ],
      },
      {
        participants: [
          ["transaction", "transactions", null, null, null],
          ["customer_card", "card", null, 1, null]
        ],
      },
      {
        participants: [
          ["transaction_report_line", "lines", null, null, null],
          ["transaction_report", "report", null, 1, null]
        ],
      },
      {
        participants: [
          ["transaction_report_line", "line", 0, null, 1],
          ["transaction", "transaction", null, 1, null]
        ],
      },
      {
        participants: [
          ["transaction_report", "report", null, null, null],
          ["customer_card", "card", null, 1, null]
        ],
      },
      // {
      //   participants: [
      //     ["transaction_report", "transaction_report", null, null, null],
      //     ["transaction", "transaction", 0, null, 1]
      //   ],
      //   is_unary: true
      // }
    ]
  }


  const e = new ModelEnv(uml_book, opts)

  const clp = "loyalty_program"
  const cl_cc = "customer"
  const ccc = "customer_card"
  const cmb = "membership"
  const cla = "loyalty_account"
  const cpp = "program_partner"
  const cs = "service"
  const csl = "service_level"
  const ct = "transaction"
  const ce = "earning"

  const ctr = "transaction_report"
  const k_c = e.bound_of(cl_cc)

  const v_date_now = rl_date_ops(e)

  if (!opt_conflict_free) {
    e.named("invariant_ServiceLevel1", e.forall_instances(csl, sl => `(= 0 (+ ${e.assoc_vec(csl, sl, ["program", "partners"]).map(b2i).join(" ")}))`))
  }

  e.named("invariant_points", e.forall_instances(cla, la => `(=> 
    (> ${e.attr(cla, "points", la)} 0)
    ${e.exists_navigate(cla, la, ["transactions"], ([la, t]) => `(> ${e.attr(ct, "points", t)} 0)`)}
  )`))

  e.named("invariant_transactions", e.forall_instances(cla, la => e.exists_navigate(cla, la, ["transactions"], ([la, t]) => `(= ${e.attr(ct, "points", t)} 500)`)))

  e.named("invariant_oneOwner", e.forall_instances(cla, la => {
    const xs = e.assoc_vec(cla, la, ["transactions", "card", "owner"])
    return `(= 1 (+ ${pb_fold(xs, k_c).map(b2i).join(" ")}))`
  }))

  if (!opts.unbounded_compatible) {
    e.named("invariant_totalPointsEarning2", e.forall_instances(cpp, pp => {
      const tx = e
        .iterate_navigate(cpp, pp, ["delivered_services", "transactions"], ([pp, s, tx], _, conj) => [tx, `(and ${conj.join(" ")} ${e.exists_cast(ct, tx, ce)})`], xs => xs)
        .map(([tx, conj]) => `(ite ${conj} ${e.attr(ct, "points", tx)} 0)`)

      return `(< (+ ${tx.join(" ")}) 10000)`
    }))

    e.named("invariant_nrOfParticipants", e.forall_instances(cpp, pp => `(= ${e.attr(cpp, "number_of_customers", pp)} (+ ${e.assoc_vec(cpp, pp, ["programs", "participants"]).map(b2i).join(" ")}))`))

    e.named("invariant_totalPoints", e.forall_instances(cpp, pp => {
      const tx = e.iterate_navigate(cpp, pp, ["delivered_services", "transactions"], ([pp, s, tx], _, conj) => [tx, `(and ${conj.join(" ")})`], xs => xs).map(([tx, conj]) => `(ite ${conj} ${e.attr(ct, "points", tx)} 0)`)

      return `(< (+ ${tx.join(" ")}) 10000)`
    }))
  }



  e.named("invariant_ProgramPartner1", e.forall_instances(cpp, pp => {
    const xs = e.assoc_vec(cpp, pp, ["programs", "partners"])
    const sel = e.assoc_filter_pb(xs, cpp, pp2 => `(distinct ${pp2} ${pp})`)
    return `(= 0 (+ ${sel.map(b2i).join(" ")}))`
  }))

  if (!opts.unbounded_compatible) {
    e.named("invariant_nrOfParticipants2", e.forall_instances(cpp, pp => `(= ${e.attr(cpp, "number_of_customers", pp)} (+ ${pb_fold(e.assoc_vec(cpp, pp, ["programs", "participants"]), k_c).map(b2i).join(" ")}))`))
  }


  e.named("invariant_dates", e.forall_instances(ctr, tr => e.forall_navigate(ctr, tr, ["lines", "transaction"], ([tr, trl, t]) => `(and
  (date_is_before ${e.attr(ct, "date", t)} ${e.attr(ctr, "until", tr)})
  (date_is_after ${e.attr(ct, "date", t)} ${e.attr(ctr, "from", tr)})
)`)))

  e.named("invariant_cycle", e.forall_instances(ctr, (tr) => e.assoc_path_includes_all(ctr, tr, ["card", "transactions"], ["lines", "transaction"])))

  e.named("invariant_CustomerCard4", e.forall_instances(ccc, (cc) => {
    const xs = e.assoc_vec(ccc, cc, ["transactions"])
    return `(distinct 0 (+ ${e.assoc_filter_pb(xs, ct, t => `(> ${e.attr(ct, "points", t)} 100)`).map(b2i).join(" ")}))`
  }))

  e.named("invariant_ofAge", e.forall_instances(ccc, id_cc => e.exists_navigate(ccc, id_cc, ["owner"], ([id_cc, c]) => `(>= ${e.attr(cl_cc, "age", c)} 18)`)))

  // do have customer, and customer do have program
  e.named("invariant_CustomerCard3", e.forall_instances(ccc, (cc) => {
    const xs = e.assoc_vec(ccc, cc, ["owner", "programs"])
    return `(> (+ ${xs.map(b2i).join(" ")}) 0)`
  }))

  e.named("invariant_checkDates", e.forall_instances(ccc, (cc) => `(date_is_before ${e.attr(ccc, "valid_from", cc)} ${e.attr(ccc, "valid_thru", cc)})`))

  e.named("invariant_CustomerCard2", e.forall_instances(ccc, (id_cc) => e.exists_navigate(ccc, id_cc, ["owner"], ([id_cc, c]) => `(date_is_before ${e.attr(cl_cc, "dob", c)} ${v_date_now})`)))

  e.named("invariant_CustomerCard1", e.forall_instances(ccc, (cc) => `(date_is_after ${e.attr(ccc, "valid_thru", cc)} ${v_date_now})`))

  e.named("invariant_THIS", e.forall_instances(ccc, (cc) => `(ite
    ${e.attr(ccc, "valid", cc)}
    (not (and 
      (date_is_before ${e.attr(ccc, "valid_from", cc)} ${v_date_now})
      (date_is_after ${e.attr(ccc, "valid_thru", cc)} ${v_date_now})
    ))
    (and 
      (date_is_before ${e.attr(ccc, "valid_from", cc)} ${v_date_now})
      (date_is_after ${e.attr(ccc, "valid_thru", cc)} ${v_date_now})
    )
  )`))

  // no "as set" constraint
  e.named("invariant_Membership1", e.forall_instances(cmb, (mb) => `(or
    (= 0 (+ ${e.assoc_vec(cmb, mb, ["account"]).map(b2i).join(" ")}))
    ${e.exists_navigate(cmb, mb, ["account"], ([mb, acc]) => `(>= ${e.attr(cla, "points", acc)} 0)`)}
  )`))



  e.named("invariant_Membership2", e.forall_instances(cmb, (mb) => e.exists_navigate(cmb, mb, ["participants", "cards", "membership"], ([m, p, c, mb2]) => `(= ${mb2} ${mb})`)))

  e.named("invariant_noEarnings", e.forall_instances(cmb, (mb) => `(=>
    ${e.forall_navigate(cmb, mb, ["programs", "partners", "delivered_services"], ([mb, p, pp, s]) => `(= 0 ${e.attr(cs, "points_earned", s)})`)}
    (= 0 (+ ${e.assoc_vec(cmb, mb, ["account"]).map(b2i).join(" ")}))
  )`))

  e.named("invariant_correctCard", e.forall_instances(cmb, (mb) => e.assoc_path_includes(cmb, mb, ["participants", "cards"], ["card"])))

  e.named("invariant_Membership3", e.forall_instances(cmb, (mb) => e.assoc_path_includes(cmb, mb, ["programs", "levels"], ["current_level"])))

  if (!opt_conflict_free) {
    e.named("invariant_Membership4", e.forall_instances(cmb, (mb) => `(= 0 (+ ${e.assoc_vec(cmb, mb, ["account"]).map(b2i).join(" ")}))`))
  }


  e.named("invariant_levelAndColor", e.forall_instances(cmb, (mb) => `(and
    (=>
      ${e.exists_navigate(cmb, mb, ["current_level"], ([mb, lv]) => `(= ${e.attr(csl, "name", lv)} "Silver")`)}
      ${e.exists_navigate(cmb, mb, ["card"], ([mb, cc]) => `(= ${e.attr(ccc, "color", cc)} ${e.enum("ColorSilver")})` )}
    )
    
    (=>
      ${e.exists_navigate(cmb, mb, ["current_level"], ([mb, lv]) => `(= ${e.attr(csl, "name", lv)} "Gold")`)}
      ${e.exists_navigate(cmb, mb, ["card"], ([mb, cc]) => `(= ${e.attr(ccc, "color", cc)} ${e.enum("ColorGold")})` )}
    )
  )`))

  e.named("invariant_Service1", e.forall_instances(cs, (s) => `(=>
    (> ${e.attr(cs, "points_earned", s)} 0)
    (distinct ${e.attr(cs, "points_burned", s)} 0)
  )`))

  if (!opt_conflict_free) {
    // no delivered service
    // implies no programs or no partner of customer
    // must be no programs, because partner [1, *] .. [1, *] program
    e.named("invariant_Customer10", e.forall_instances(cl_cc, c => `(=
    0
    (+ ${e.assoc_vec(cl_cc, c, ["programs", "partners"]).map(b2i).join(" ")})
  )`))
  }


  e.named("invariant_Customer1", e.forall_instances(cl_cc, c => `(>
    (+ ${e.assoc_filter_pb(e.assoc_vec(cl_cc, c, ["cards"]), ccc, cc => e.attr(ccc, "valid", cc)).map(b2i).join(" ")})
    1
  )`))

  e.named("invariant_Customer7", e.forall_instances(cl_cc, c => `(=> 
  (= ${e.attr(cl_cc, "gender", c)} ${e.enum("GenderMale")})
  (= ${e.attr(cl_cc, "title", c)} "Mr.")
)`))

  // no account number < 10000
  e.named("invariant_ANY", e.forall_instances(cl_cc, c => `(=
    0
    (+ ${e.assoc_filter_pb(e.assoc_vec(cl_cc, c, ["membership", "account"]), cla, la => `(< ${e.attr(cla, "number", la)} 10000)`).map(b2i).join(" ")})
  )`))

  e.named("invariant_ofAge_cc", e.forall_instances(cl_cc, c => `(>= ${e.attr(cl_cc, "age", c)} 18)`))

  if (!opts.unbounded_compatible) {
    e.named("invariant_sizesAgree", e.forall_instances(cl_cc, c => `(= 
    (+ ${e.assoc_vec(cl_cc, c, ["programs"]).map(b2i).join(" ")})
    (+ ${e.assoc_filter_pb(e.assoc_vec(cl_cc, c, ["cards"]), ccc, cc => e.attr(ccc, "valid", cc)).map(b2i).join(" ")})
  )`))
  }

  e.named("invariant_Customer8", e.forall_instances(cl_cc, c => `(=
    0
    (+ ${e.assoc_filter_pb(e.assoc_vec(cl_cc, c, ["membership", "account"]), cla, la => `(> ${e.attr(cla, "points", la)} 0)`).map(b2i).join(" ")})
  )`))

// this causes single c
  e.named("invariant_Customer6", e.forall_instances(cl_cc, c => `(and 
    (= ${e.attr(cl_cc, "name", c)} "Edward")
    (= ${e.attr(cl_cc, "title", c)} "Mr.")
  )`))

  e.named("invariant_LoyaltyProgram18", e.forall_instances(clp, lp => e.assoc_each_distinct(clp, lp, ["participants"], (c1, c2) => `(distinct
    ${e.attr(cl_cc, "name", c1)}
    ${e.attr(cl_cc, "name", c2)}
  )`)))

  e.named("invariant_LoyaltyProgram1", e.forall_instances(clp, lp => e.assoc_path_includes_all(clp, lp, ["levels"], ["membership", "current_level"])))

  e.named("invariant_LoyaltyProgram14", e.forall_instances(clp, (lp) => e.assoc_each_distinct(clp, lp, ["membership", "account"], (a1, a2) => `(distinct
    ${e.attr(cla, "number", a1)}
    ${e.attr(cla, "number", a2)}
  )`)))

  if (!opts.unbounded_compatible) {
    e.named("invariant_firstLevel", e.forall_instances(clp, (lp) => e.ord_assoc_at(clp, lp, "levels", 0, sl => `(= ${e.attr(csl, "name", sl)} "Silver")`)))
  }

  e.named("invariant_minServices", e.forall_instances(clp, (lp) => `(>=
    (+ ${e.assoc_vec(clp, lp, ["partners", "delivered_services"]).map(b2i).join(" ")})
    1
  )`))

  if (!opt_conflict_free) {
    // one loyal account < 10000
    // (membership) do have account
    e.named("invariant_LoyaltyProgram19",  e.forall_instances(clp, (lp) => {
      const xs = e.assoc_vec(clp, lp, ["membership", "account"])
      const ys = e.assoc_filter_pb(xs, cla, la => `(< ${e.attr(cla, "number", la)} 10000)`)
      return `(= 1 (+ ${ys.map(b2i).join(" ")}))`
    }))
  }

  if (!opts.unbounded_compatible) {
    e.named("invariant_LoyaltyProgram12", e.forall_instances(clp, (lp) => `(< 
    (+ ${e.assoc_vec(clp, lp, ["participants"]).map(b2i).join(" ")})
    10000
  )`))
  }

  e.named("invariant_LoyaltyProgram2", e.forall_instances(clp, (lp) => e.exists_navigate(clp, lp, ["levels"], ([lp, sl]) => `(= ${e.attr(csl, "name", sl)} "basic")`)))

  e.named("invariant_noAccounts", e.forall_instances(clp, (lp) => e.forall_navigate(clp, lp, ["partners", "delivered_services"], ([lp, pp, s]) => `(=>
    (and (= 0 ${e.attr(cs, "points_earned", s)}) (= 0 ${e.attr(cs, "points_burned", s)}))
    (= 0 (+ ${e.assoc_vec(clp, lp, ["membership", "account"]).map(b2i).join(" ")}))
  )`)))

  e.named("invariant_LoyaltyProgram16", e.forall_instances(clp, (lp) => e.forall_navigate(clp, lp, ["participants"], ([lp, c]) => `(<=
    ${e.attr(cl_cc, "age", c)}
    70
  )`)))

  return e
}

// const opts = mk_options(false, false, 5)
// opts.core = true
// gen_fml(gen(opts))

export default gen

