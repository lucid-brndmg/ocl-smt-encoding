echo "" > gen/z3_b6_sat.sh
echo "" > gen/z3_b6_sat.log
echo "" > gen/z3_b6_unsat.sh
echo "" > gen/z3_b6_unsat.log

echo "" > gen/z3_b12_sat.sh
echo "" > gen/z3_b12_sat.log
echo "" > gen/z3_b12_unsat.sh
echo "" > gen/z3_b12_unsat.log

echo "" > gen/z3_b24_sat.sh
echo "" > gen/z3_b24_sat.log
echo "" > gen/z3_b24_unsat.sh
echo "" > gen/z3_b24_unsat.log

echo "" > gen/z3_us_sat.sh
echo "" > gen/z3_us_sat.log
echo "" > gen/z3_us_unsat.sh
echo "" > gen/z3_us_unsat.log

echo "" > gen/cvc5_b6_sat.sh
echo "" > gen/cvc5_b6_sat.log
echo "" > gen/cvc5_b6_unsat.sh
echo "" > gen/cvc5_b6_unsat.log

echo "" > gen/cvc5_b12_sat.sh
echo "" > gen/cvc5_b12_sat.log
echo "" > gen/cvc5_b12_unsat.sh
echo "" > gen/cvc5_b12_unsat.log

echo "" > gen/cvc5_b24_sat.sh
echo "" > gen/cvc5_b24_sat.log
echo "" > gen/cvc5_b24_unsat.sh
echo "" > gen/cvc5_b24_unsat.log

echo "" > gen/cvc5-fmf_us_sat.sh
echo "" > gen/cvc5-fmf_us_sat.log
echo "" > gen/cvc5-fmf_us_unsat.sh
echo "" > gen/cvc5-fmf_us_unsat.log

bun run codegen_check.js aed sat b 6
bun run codegen_check.js aed sat b 12
bun run codegen_check.js aed sat b 24
bun run codegen_check.js aed sat us
bun run codegen_check.js am sat b 6
bun run codegen_check.js am sat b 12
bun run codegen_check.js am sat b 24
bun run codegen_check.js am sat us
bun run codegen_check.js am unsat b 6
bun run codegen_check.js am unsat b 12
bun run codegen_check.js am unsat b 24
bun run codegen_check.js am unsat us
bun run codegen_check.js bart sat b 6
bun run codegen_check.js bart sat b 12
bun run codegen_check.js bart sat b 24
bun run codegen_check.js cd sat b 6
bun run codegen_check.js cd sat b 12
bun run codegen_check.js cd sat b 24
bun run codegen_check.js cd sat us
bun run codegen_check.js cr sat b 6
bun run codegen_check.js cr sat b 12
bun run codegen_check.js cr sat b 24
bun run codegen_check.js cr sat us
bun run codegen_check.js cr unsat b 6
bun run codegen_check.js cr unsat b 12
bun run codegen_check.js cr unsat b 24
bun run codegen_check.js cr unsat us
bun run codegen_check.js cw sat b 6
bun run codegen_check.js cw sat b 12
bun run codegen_check.js cw sat b 24
bun run codegen_check.js cw sat us
bun run codegen_check.js cs sat b 6
bun run codegen_check.js cs sat b 12
bun run codegen_check.js cs sat b 24
bun run codegen_check.js cs sat us
bun run codegen_check.js dblp sat b 6
bun run codegen_check.js dblp sat b 12
bun run codegen_check.js dblp sat b 24
bun run codegen_check.js dblp sat us
bun run codegen_check.js ds sat b 6
bun run codegen_check.js ds sat b 12
bun run codegen_check.js ds sat b 24
bun run codegen_check.js ds sat us
bun run codegen_check.js ds unsat b 6
bun run codegen_check.js ds unsat b 12
bun run codegen_check.js ds unsat b 24
bun run codegen_check.js ds unsat us
bun run codegen_check.js ehr sat b 6
bun run codegen_check.js ehr sat b 12
bun run codegen_check.js ehr sat b 24
bun run codegen_check.js ehr sat us
bun run codegen_check.js ehr unsat b 6
bun run codegen_check.js ehr unsat b 12
bun run codegen_check.js ehr unsat b 24
bun run codegen_check.js ehr unsat us
bun run codegen_check.js ex sat b 6
bun run codegen_check.js ex sat b 12
bun run codegen_check.js ex sat b 24
bun run codegen_check.js oai sat b 6
bun run codegen_check.js oai sat b 12
bun run codegen_check.js oai sat b 24
bun run codegen_check.js percom sat b 6
bun run codegen_check.js percom sat b 12
bun run codegen_check.js percom sat b 24
bun run codegen_check.js percom sat us
bun run codegen_check.js pr sat b 6
bun run codegen_check.js pr sat b 12
bun run codegen_check.js pr sat b 24
bun run codegen_check.js pr sat us
bun run codegen_check.js pr unsat b 6
bun run codegen_check.js pr unsat b 12
bun run codegen_check.js pr unsat b 24
bun run codegen_check.js pr unsat us
bun run codegen_check.js rl_a sat b 6
bun run codegen_check.js rl_a sat b 12
bun run codegen_check.js rl_a sat b 24
bun run codegen_check.js rl_a sat us
bun run codegen_check.js rl_a unsat b 6
bun run codegen_check.js rl_a unsat b 12
bun run codegen_check.js rl_a unsat b 24
bun run codegen_check.js rl_a unsat us
bun run codegen_check.js rl_b sat b 6
bun run codegen_check.js rl_b sat b 12
bun run codegen_check.js rl_b sat b 24
bun run codegen_check.js rl_b sat us
bun run codegen_check.js rl_b unsat b 6
bun run codegen_check.js rl_b unsat b 12
bun run codegen_check.js rl_b unsat b 24
bun run codegen_check.js rl_b unsat us
bun run codegen_check.js rl_c sat b 6
bun run codegen_check.js rl_c sat b 12
bun run codegen_check.js rl_c sat b 24
bun run codegen_check.js rl_c sat us
bun run codegen_check.js rl_c unsat b 6
bun run codegen_check.js rl_c unsat b 12
bun run codegen_check.js rl_c unsat b 24
bun run codegen_check.js rl_c unsat us
bun run codegen_check.js student sat b 6
bun run codegen_check.js student sat b 12
bun run codegen_check.js student sat b 24
bun run codegen_check.js student sat us
bun run codegen_check.js student unsat b 6
bun run codegen_check.js student unsat b 12
bun run codegen_check.js student unsat b 24
bun run codegen_check.js student unsat us
bun run codegen_check.js train sat b 6
bun run codegen_check.js train sat b 12
bun run codegen_check.js train sat b 24
bun run codegen_check.js transport sat b 6
bun run codegen_check.js transport sat b 12
bun run codegen_check.js transport sat b 24
bun run codegen_check.js transport sat us
bun run codegen_check.js transport unsat b 6
bun run codegen_check.js transport unsat b 12
bun run codegen_check.js transport unsat b 24
bun run codegen_check.js transport unsat us