
echo ":model:am_unsat_strict_unbounded:us:0:4" >> cvc5-fmf_us_unsat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 am_unsat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_unsat.log
echo ":done:am_unsat_strict_unbounded" >> cvc5-fmf_us_unsat.log
echo "done am_unsat_strict_unbounded"
echo ":model:car_rental_unsat_strict_unbounded:us:0:12" >> cvc5-fmf_us_unsat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 car_rental_unsat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_unsat.log
echo ":done:car_rental_unsat_strict_unbounded" >> cvc5-fmf_us_unsat.log
echo "done car_rental_unsat_strict_unbounded"
echo ":model:ds_unsat_strict_unbounded:us:0:1" >> cvc5-fmf_us_unsat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 ds_unsat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_unsat.log
echo ":done:ds_unsat_strict_unbounded" >> cvc5-fmf_us_unsat.log
echo "done ds_unsat_strict_unbounded"
echo ":model:ehr_a_unsat_strict_unbounded:us:0:22" >> cvc5-fmf_us_unsat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 ehr_a_unsat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_unsat.log
echo ":done:ehr_a_unsat_strict_unbounded" >> cvc5-fmf_us_unsat.log
echo "done ehr_a_unsat_strict_unbounded"
echo ":model:pr_unsat_strict_unbounded:us:0:5" >> cvc5-fmf_us_unsat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 pr_unsat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_unsat.log
echo ":done:pr_unsat_strict_unbounded" >> cvc5-fmf_us_unsat.log
echo "done pr_unsat_strict_unbounded"
echo ":model:rl_a_unsat_strict_unbounded:us:0:37" >> cvc5-fmf_us_unsat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 rl_a_unsat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_unsat.log
echo ":done:rl_a_unsat_strict_unbounded" >> cvc5-fmf_us_unsat.log
echo "done rl_a_unsat_strict_unbounded"
echo ":model:rl_b_unsat_strict_unbounded:us:0:37" >> cvc5-fmf_us_unsat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 rl_b_unsat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_unsat.log
echo ":done:rl_b_unsat_strict_unbounded" >> cvc5-fmf_us_unsat.log
echo "done rl_b_unsat_strict_unbounded"
echo ":model:rl_c_unsat_strict_unbounded:us:0:21" >> cvc5-fmf_us_unsat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 rl_c_unsat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_unsat.log
echo ":done:rl_c_unsat_strict_unbounded" >> cvc5-fmf_us_unsat.log
echo "done rl_c_unsat_strict_unbounded"
echo ":model:student_unsat_strict_unbounded:us:0:8" >> cvc5-fmf_us_unsat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 student_unsat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_unsat.log
echo ":done:student_unsat_strict_unbounded" >> cvc5-fmf_us_unsat.log
echo "done student_unsat_strict_unbounded"
echo ":model:transport_unsat_strict_unbounded:us:0:3" >> cvc5-fmf_us_unsat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 transport_unsat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_unsat.log
echo ":done:transport_unsat_strict_unbounded" >> cvc5-fmf_us_unsat.log
echo "done transport_unsat_strict_unbounded"
