import {ModelEnv, pb_sum} from "./index.js";
import {gen_fml} from "./utils.js"
import {UnboundedEnv} from "./unbounded.js";

const gen = opts => {
  const uml = {
    logic: "SLIA",
    name: "dblp",
    classes: {
      person: {
        name: "String",
        home_page: "String",
        num_publications: "Int"
      },
      publication: {
        title: "String"
      },
      book: {
        _extends: ["publication"],
        num_pages: "Int",
        home_page: "String",
        publisher: "String",
        publication_year: "Int",
        isbn: "String"
      },

      edited_book: {
        _extends: ["book", "publication"]
      },

      book_series_issue: {
        _extends: ["book"],
        number: "Int"
      },

      authored_publication: {
        _extends: ["publication"]
      },

      authored_book: {
        _extends: ["book", "authored_publication"]
      },

      book_chapter: {
        _extends: ["authored_publication"],
        ini_page: "Int",
        end_page: "Int",
        conference_paper: "Bool"
      },

      book_section: {
        title: "String",
        order: "Int"
      },

      book_series: {
        id: "String",
        publisher: "String"
      },

      journal_paper: {
        _extends: ["authored_publication"],
        ini_page: "Int",
        end_page: "Int",
        conference_paper: "Bool"
      },

      journal_issue: {
        number: "Int",
        year: "Int",
        month: "String",
        num_pages: "Int"
      },
      journal_volume: {
        volume: "Int"
      },
      journal: {
        title: "String",
        issn: "String"
      },
      journal_section: {
        title: "String",
        order: "Int"
      },


      conference_edition: {
        title: "String",
        year: "Int",
        city: "String",
        country: "String",
        home_page: "String"
      },
      conference_series: {
        acronym: "String",
        name: "String"
      }
    },

    assoc: [
      {
        participants: [
          ["edited_book", "edited_book", null, null, null],
          ["person", "editor", 1, null, null]
        ]
      },
      {
        participants: [
          ["person", "author", 1, null, null],
          ["authored_publication", "authored_publication", null, null, null]
        ]
      },
      {
        participants: [
          ["person", "person", 1, null, null],
          ["publication", "publication", 1, null, null],
        ]
      },
      {
        participants: [
          ["edited_book", "edited_book", 0, null, 1],
          ["conference_edition", "conference_edition", 0, null, 1]
        ]
      },
      {
        participants: [
          ["edited_book", "edited_book", 0, null, 1],
          ["book_chapter", "book_chapter", 1, null, null]
        ]
      },
      {
        participants: [
          ["edited_book", "edited_book", 0, null, 1],
          ["book_section", "book_section", null, null, null]
        ]
      },

      {
        participants: [
          ["book_series_issue", "book_series_issue", 0, null, 1],
          ["book_section", "book_section", null, null, null]
        ]
      },
      {
        participants: [
          ["book_series_issue", "book_series_issue", 0, null, 1],
          ["book_chapter", "book_chapter", 1, null, null]
        ]
      },
      {
        participants: [
          ["book_series_issue", "book_series_issue", 0, null, 1],
          ["book_series", "book_series", null, 1, null]
        ]
      },

      {
        participants: [
          ["book_section", "book_section", 0, null, 1],
          ["book_chapter", "book_chapter", 1, null, null]
        ]
      },

      {
        participants: [
          ["conference_edition", "conference_edition", 0, null, 1],
          ["book_series_issue", "book_series_issue", 0, null, 1]
        ]
      },

      {
        participants: [
          ["conference_edition", "conference_edition", 0, null, 1],
          ["journal_issue", "journal_issue", 0, null, 1]
        ]
      },

      {
        participants: [
          ["conference_edition", "conference_edition", null, null, null],
          ["conference_series", "conference_series", null, 1, null]
        ]
      },

      {
        participants: [
          ["journal_paper", "journal_paper", 1, null, null],
          ["journal_section", "journal_section", 0, null, 1],
        ]
      },
      {
        participants: [
          ["journal_paper", "journal_paper", 1, null, null],
          ["journal_issue", "journal_issue", null, 1, null],
        ]
      },
      {
        participants: [
          ["journal_section", "journal_section", null, null, null],
          ["journal_issue", "journal_issue", null, 1, null],
        ]
      },
      {
        participants: [
          ["journal_issue", "journal_issue", null, null, null],
          ["journal_volume", "journal_volume", null, 1, null]
        ]
      },
      {
        participants: [
          ["journal", "journal", null, 1, null],
          ["journal_volume", "journal_volume", 0, null, null]
        ]
      },

    ]
  }

  const e = new UnboundedEnv(uml, opts)

  const cpb = "publication"
  const cps = "person"
  const cap = "authored_publication"
  const cbc = "book_chapter"

  const cb = "book"
  const cab = "authored_book"
  const ceb = "edited_book"
  const cbsc = "book_section"
  const cbsr = "book_series"
  const cbsi = "book_series_issue"

  const cji = "journal_issue"
  const cjv = "journal_volume"
  const cjs = "journal_section"
  const cj = "journal"
  const cjp = "journal_paper"
  const cce = "conference_edition"
  const ccs = "conference_series"

  e.named(`${cps}_nameIsKey`, e.forall_instances(cps, (ps) => e.assoc_each_distinct(cps, ps, [], (p1, p2) => `(distinct
    ${e.attr(cps, "name", p1)}
    ${e.attr(cps, "name", p2)}
  )`)))

  e.named(`${cb}_isbnIsKey`, e.forall_instances(cb, (b) => e.assoc_each_distinct(cb, b, [], (b1, b2) => `(distinct
    ${e.attr(cb, "isbn", b1)}
    ${e.attr(cb, "isbn", b2)}
  )`)))

  e.named(`${cbsr}_idIsKey`, e.forall_instances(cbsr, (bsr) => e.assoc_each_distinct(cbsr, bsr, [], (bsr1, bsr2) => `(distinct
    ${e.attr(cbsr, "id", bsr1)}
    ${e.attr(cbsr, "id", bsr2)}
  )`)))

  e.named("idAndNumberIdentifyBookSeriesIssue", e.forall_instances(cbsr, (bsr) => e.assoc_each_distinct(cbsr, bsr, ["book_series_issue"], (bsi1, bsi2) => `(distinct
    ${e.attr(cbsi, "number", bsi1)}
    ${e.attr(cbsi, "number", bsi2)}
  )`)))

  e.named(`${cj}_issnIsKey`, e.forall_instances(cj, (j) => e.assoc_each_distinct(cj, j, [], (j1, j2) => `(distinct
    ${e.attr(cj, "issn", j1)}
    ${e.attr(cj, "issn", j2)}
  )`)))

  e.named(`${cj}_titleIsKey`, e.forall_instances(cj, (j) => e.assoc_each_distinct(cj, j, [], (j1, j2) => `(distinct
    ${e.attr(cj, "title", j1)}
    ${e.attr(cj, "title", j2)}
  )`)))

  e.named(`${cj}_journalAndVolumeIdentifyJournalVolume`, e.forall_instances(cj, (j) => e.assoc_each_distinct(cj, j, ["journal_volume"], (jv1, jv2) => `(distinct
    ${e.attr(cjv, "volume", jv1)}
    ${e.attr(cjv, "volume", jv2)}
  )`)))

  e.named(`${cjv}_journalVolumeAndNumberIdentifyJournalIssue`, e.forall_instances(cjv, (jv) => e.assoc_each_distinct(cjv, jv, ["journal_issue"], (ji1, ji2) => `(distinct
    ${e.attr(cji, "number", ji1)}
    ${e.attr(cji, "number", ji2)}
  )`)))

  e.named(`${cji}_journalAndTitleIdentifyJournalSection`, e.forall_instances(cji, (ji) => e.assoc_each_distinct(cji, ji, ["journal_section"], (js1, js2) => `(distinct
    ${e.attr(cjs, "title", js1)}
    ${e.attr(cjs, "title", js2)}
  )`)))

  e.named(`${ccs}_nameIsKey`, e.forall_instances(ccs, (cs) => e.assoc_each_distinct(ccs, cs, [], (cs1, cs2) => `(distinct
    ${e.attr(ccs, "name", cs1)}
    ${e.attr(ccs, "name", cs2)}
  )`)))

  e.named(`${cce}_titleIsKey`, e.forall_instances(cce, (ce) => e.assoc_each_distinct(cce, ce, [], (ce1, ce2) => `(distinct
    ${e.attr(cce, "title", ce1)}
    ${e.attr(cce, "title", ce2)}
  )`) ))

  e.named(`${cbc}_correctPagination`, e.forall_instances(cbc, (bc) => `(<=
    ${e.attr(cbc, "ini_page", bc)}
    ${e.attr(cbc, "end_page", bc)}
  )`))

  e.named(`${cjp}_correctPagination`, e.forall_instances(cjp, (jp) => `(<=
    ${e.attr(cjp, "ini_page", jp)}
    ${e.attr(cjp, "end_page", jp)}
  )`))

  e.named(`${cji}_correctPagination`, e.forall_instances(cji, (ji) => e.assoc_each_distinct(cji, ji, ["journal_paper"], (jp1, jp2) => `(or
    (> ${e.attr(cjp, "ini_page", jp1)} ${e.attr(cjp, "end_page", jp2)})
    (> ${e.attr(cjp, "ini_page", jp2)} ${e.attr(cjp, "end_page", jp1)})
  )`)))

  e.named(`${ceb}_correctPagination`, e.forall_instances(ceb, (eb) => e.assoc_each_distinct(ceb, eb, ["book_chapter"], (bc1, bc2) => `(or
    (> ${e.attr(cbc, "ini_page", bc1)} ${e.attr(cbc, "end_page", bc2)})
    (> ${e.attr(cbc, "ini_page", bc2)} ${e.attr(cbc, "end_page", bc1)})
  )`)))

  e.named(`${cbsi}_correctPagination`, e.forall_instances(cbsi, (bsi) => e.assoc_each_distinct(cbsi, bsi, ["book_chapter"], (bc1, bc2) => `(or
    (> ${e.attr(cbc, "ini_page", bc1)} ${e.attr(cbc, "end_page", bc2)})
    (> ${e.attr(cbc, "ini_page", bc2)} ${e.attr(cbc, "end_page", bc1)})
  )`)))
  //
  // const k_jv = e.bound_of(cjv)
  // const k_j = e.bound_of(cj)
  // // const sjv_sizes = []
  // // const sjv_contents = []
  //
  //
  // const accessor = e.decl_accessor(cjv, "volume")
  //
  // const axiom_ordered = []
  //
  // for (let j = 0; j < k_j; j++) {
  //   const axm = []
  //   const assoc = e.class_summary.get(cj).associations["journal_volume"]
  //   const id = `sjv_size_${j}`
  //   e.decl_const(id, `Int`)
  //   // sjv_sizes.push(id)
  //
  //   for (let jv = 0; jv < k_jv; jv++) {
  //     const id = `sjv_cnt_${j}_${jv}`
  //     e.decl_const(id, `Int`)
  //     // sjv_contents.push(id)
  //     // consecutive
  //     axm.push(`(=> (< ${jv} sjv_size_${j})
  //       (= (${accessor} sjv_cnt_${j}_${jv}) ${jv})
  //     )`)
  //
  //     const disj1 = []
  //     const disj2 = []
  //     for (let i = 0; i < k_jv; i++) {
  //       disj1.push(`(and (= sjv_cnt_${j}_${jv} ${i}) ${e.in_assoc_set(assoc, j, i)})`)
  //       disj2.push(`(and (= sjv_cnt_${j}_${i} ${jv}) (< ${i} sjv_size_${j}))`)
  //     }
  //     // sjv subset_of assoc
  //     axm.push(`(=>
  //       (< ${jv} sjv_size_${j})
  //       (or ${disj1.join(" ")})
  //     )`)
  //     // assoc subset_of sjv
  //     axm.push(`(=> ${e.in_assoc_set(assoc, j, jv)} (or ${disj2.join(" ")}))`)
  //   }
  //
  //   // order
  //   for (let jv = 1; jv < k_jv; jv++) {
  //     axm.push(`(=> (< ${jv} sjv_size_${j})
  //       (< (${accessor} sjv_cnt_${j}_${jv - 1}) (${accessor} sjv_cnt_${j}_${jv}))
  //     )`)
  //   }
  //
  //   axiom_ordered.push(`(and ${axm.join(" ")})`)
  // }
  //
  // e.named(`${cj}_consecutiveVolumes`, e.forall_instances(cj, ([j]) => axiom_ordered[j]))
  //
  e.named(`${ceb}_compatibleYear`, e.forall_instances(ceb, (eb) => `(=>
    ${e.not_empty(ceb, eb, ["conference_edition"])}
    ${e.exists_navigate(ceb, eb, ["conference_edition"], ([eb, ce]) => e.exists_cast(ceb, eb, cb, b => `(>= ${e.attr(cb, "publication_year", b)} ${e.attr(cce, "year", ce)})`))}
  )`))

  e.named(`${cbsi}_compatibleYear`, e.forall_instances(cbsi, (bsi) => `(=>
    ${e.not_empty(cbsi, bsi, ["conference_edition"])}
    ${e.exists_navigate(cbsi, bsi, ["conference_edition"], ([bsi, ce]) => e.exists_cast(cbsi, bsi, cb, b => `(>= ${e.attr(cb, "publication_year", b)} ${e.attr(cce, "year", ce)})`))}
  )`))

  e.named(`${cji}_compatibleYear`, e.forall_instances(cji, (ji) => `(=>
    ${e.not_empty(cji, ji, ["conference_edition"])}
    ${e.exists_navigate(cji, ji, ["conference_edition"], ([ji, ce]) => `(>= ${e.attr(cji, "year", ji)} ${e.attr(cce, "year", ce)})`)}
  )`))

  e.named(`${ceb}_editedBookWithoutRepetitions`, e.forall_instances(ceb, (eb) => e.assoc_each_distinct(ceb, eb, ["book_section"], (bs1, bs2) => `(distinct ${e.attr(cbsc, "title", bs1)} ${e.attr(cbsc, "title", bs2)})`)))

  e.named(`${cbsi}_bookSeriesIssueWithoutRepetitions`, e.forall_instances(cbsi, (bsi) => e.assoc_each_distinct(cbsi, bsi, ["book_section"], (bs1, bs2) => `(distinct ${e.attr(cbsc, "title", bs1)} ${e.attr(cbsc, "title", bs2)})`)))

  // e.decl_indirect_cast(cbc, cap, cpb)
  // e.decl_indirect_cast(cjp, cap, cpb)
  //
  e.named(`${cjs}_journalSectionWithoutRepetitions`, e.forall_instances(cjs, (js) => e.assoc_each_distinct(cjs, js, ["journal_paper"], (jp1, jp2) => e.exists_cast_path(cjp, jp1, [cap, cpb], pb1 => e.exists_cast_path(cjp, jp2, [cap, cpb], pb2 => `(distinct ${e.attr(cpb, "title", pb1)} ${e.attr(cpb, "title", pb2)})`)))))

  e.named(`${cbsc}_bookSectionWithoutRepetitions`, e.forall_instances(cbsc, (bsc) => e.assoc_each_distinct(cbsc, bsc, ["book_chapter"], (bc1, bc2) => e.exists_cast_path(cbc, bc1, [cap, cpb], pb1 => e.exists_cast_path(cbc, bc2, [cap, cpb], pb2 => `(distinct ${e.attr(cpb, "title", pb1)} ${e.attr(cpb, "title", pb2)})`)))))

  e.named(`conferenceIsPublished`, e.forall_instances(cce, (ce) => `(or
    ${e.not_empty(cce, ce, ["edited_book"])}
    ${e.not_empty(cce, ce, ["book_series_issue"])}
    ${e.not_empty(cce, ce, ["journal_issue"])}
  )`))

  return e
}

export default gen