import {b2i, ModelEnv} from "./index.js";
import {gen_fml} from "./utils.js"

import fs from "fs";
import path from "path";

const gen = opts => {

  // const CARS = opt_cars
  // const DEALERS = 3

  const uml = {
    logic: "LIA",
    name: `car_dealer`,
    // bound: k ?? 0,
    enums: {
      Color: ["ColorRed", "ColorGreen", "ColorYellow", "ColorNull"],
      Type: ["TypeCoupe", "TypeConvertible", "TypeSuv", "TypeNull"]
    },
    classes: {
      dealer: {
        // _bound: k ,

        pref_color: "Color",
        pref_type: "Type"
      },
      car: {
        // _bound: k,

        color: "Color",
        type: "Type"
      },
    },
    assoc: [
      {
        participants: [
          ["dealer", "color_dealer", 0, null, 1],
          ["car", "color_cars", 1, null, null]
        ]
      },
      {
        participants: [
          ["dealer", "type_dealer", 0, null, 1],
          ["car", "type_cars", 1, null, null]
        ]
      }
    ]
  }

  const e = new ModelEnv(uml, opts)
  const cc = "car"
  const cd = "dealer"

// ctx Car
// inv defined: prefColor.isDefined() and prefType.isDefined()
// inv carsHaveSameColor: colorCars->forAll(c|c.color = prefColor)
// inv carsHaveSameType: typeCars->forAll(c|c.type = prefType)
// inv disjointSets: typeCars->intersection(colorCars)->size() = 0
// inv competition: Dealer.allInstances()->forAll(s|s <> self implies
// ((s.prefColor <> prefColor) and (s.prefType <> prefType)))
// inv balance: Dealer.allInstances()->forAll(s|s.colorCars->union(s.typeCars)->size() =
//   colorCars->union(typeCars)->size())

  e.assert_context(
    cd,
    e.forall_instances(cd, (d) => `(and 
    (distinct ${e.attr(cd, "pref_color", d)} ${e.enum("ColorNull")})
    (distinct ${e.attr(cd, "pref_type", d)} ${e.enum("TypeNull")})
  )`),

    e.forall_instances(cd, (d) => e.forall_navigate(cd, d, ["color_cars"], ([d, c]) => `(= ${e.attr(cd, "pref_color", d)} ${e.attr(cc, "color", c)})`)),

    e.forall_instances(cd, (d) => e.forall_navigate(cd, d, ["type_cars"], ([d, c]) => `(= ${e.attr(cd, "pref_type", d)} ${e.attr(cc, "type", c)})`)),

    e.forall_instances(cd, (d) => e.app("=", e.app("+", ...e.assoc_path_intersection(cd, d, [`type_cars`], ["color_cars"]).map(b2i)), 0)),

    e.forall_instances(cd, (d) => e.assoc_each_distinct(cd, d, [], (a, b) => `(and 
    (distinct ${e.attr(cd, "pref_color", a)} ${e.attr(cd, "pref_color", b)})
    (distinct ${e.attr(cd, "pref_type", a)} ${e.attr(cd, "pref_type", b)})
  )`)),
  )

  if (!opts.unbounded_compatible) {
    e.assert_context(cd, e.forall_instances(cd, (d) => e.assoc_each_distinct(cd, d, [], (d1, d2) =>
      `(= 
      ${e.app("+", ...e.assoc_path_union(cd, d1, ["color_cars"], ["type_cars"]).map(b2i))} 
      ${e.app("+", ...e.assoc_path_union(cd, d2, ["color_cars"], ["type_cars"]).map(b2i))}
    )`
    )))
  }

// ctx Dealer
// inv defined: color.isDefined() and type.isDefined()
// inv oneCategory: colorDealer.isUndefined() or typeDealer.isUndefined()
// inv mustBeAssigned: colorDealer.isDefined() or typeDealer.isDefined()

  e.assert_context(
    cc,
    e.forall_instances(cc, (c) => `(and 
    (distinct ${e.attr(cc, "color", c)} ${e.enum("ColorNull")})
    (distinct ${e.attr(cc, "type", c)} ${e.enum("TypeNull")})
  )`),

    e.forall_instances(cc, (c) => `(or
    (= 0 ${e.assoc_path_size_pb(cc, c, ["color_dealer"])})
    (= 0 ${e.assoc_path_size_pb(cc, c, ["type_dealer"])})
  )`),

    e.forall_instances(cc, (c) => `(or
    (distinct 0 ${e.assoc_path_size_pb(cc, c, ["color_dealer"])})
    (distinct 0 ${e.assoc_path_size_pb(cc, c, ["type_dealer"])})
  )`)
  )

  // e.unnamed(
  //   `(and ${e.dom_sized(cd, DEALERS)} ${e.dom_sized(cc, CARS)})`
  // )

  return e
}

export default gen


