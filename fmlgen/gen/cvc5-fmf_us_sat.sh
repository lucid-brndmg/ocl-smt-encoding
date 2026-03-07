
echo ":model:ae_dep_sat_strict_unbounded:us:0:10" >> cvc5-fmf_us_sat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 ae_dep_sat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_sat.log
echo ":done:ae_dep_sat_strict_unbounded" >> cvc5-fmf_us_sat.log
echo "done ae_dep_sat_strict_unbounded"
echo ":model:am_sat_strict_unbounded:us:0:3" >> cvc5-fmf_us_sat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 am_sat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_sat.log
echo ":done:am_sat_strict_unbounded" >> cvc5-fmf_us_sat.log
echo "done am_sat_strict_unbounded"
echo ":model:car_dealer_sat_strict_unbounded:us:0:8" >> cvc5-fmf_us_sat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 car_dealer_sat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_sat.log
echo ":done:car_dealer_sat_strict_unbounded" >> cvc5-fmf_us_sat.log
echo "done car_dealer_sat_strict_unbounded"
echo ":model:car_rental_sat_strict_unbounded:us:0:11" >> cvc5-fmf_us_sat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 car_rental_sat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_sat.log
echo ":done:car_rental_sat_strict_unbounded" >> cvc5-fmf_us_sat.log
echo "done car_rental_sat_strict_unbounded"
echo ":model:company_worker_sat_strict_unbounded:us:0:4" >> cvc5-fmf_us_sat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 company_worker_sat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_sat.log
echo ":done:company_worker_sat_strict_unbounded" >> cvc5-fmf_us_sat.log
echo "done company_worker_sat_strict_unbounded"
echo ":model:cs_sat_strict_unbounded:us:0:6" >> cvc5-fmf_us_sat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 cs_sat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_sat.log
echo ":done:cs_sat_strict_unbounded" >> cvc5-fmf_us_sat.log
echo "done cs_sat_strict_unbounded"
echo ":model:dblp_sat_strict_unbounded:us:0:24" >> cvc5-fmf_us_sat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 dblp_sat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_sat.log
echo ":done:dblp_sat_strict_unbounded" >> cvc5-fmf_us_sat.log
echo "done dblp_sat_strict_unbounded"
echo ":model:ds_sat_strict_unbounded:us:0:0" >> cvc5-fmf_us_sat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 ds_sat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_sat.log
echo ":done:ds_sat_strict_unbounded" >> cvc5-fmf_us_sat.log
echo "done ds_sat_strict_unbounded"
echo ":model:ehr_a_sat_strict_unbounded:us:0:21" >> cvc5-fmf_us_sat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 ehr_a_sat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_sat.log
echo ":done:ehr_a_sat_strict_unbounded" >> cvc5-fmf_us_sat.log
echo "done ehr_a_sat_strict_unbounded"
echo ":model:percom_sat_strict_unbounded:us:0:5" >> cvc5-fmf_us_sat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 percom_sat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_sat.log
echo ":done:percom_sat_strict_unbounded" >> cvc5-fmf_us_sat.log
echo "done percom_sat_strict_unbounded"
echo ":model:pr_sat_strict_unbounded:us:0:4" >> cvc5-fmf_us_sat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 pr_sat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_sat.log
echo ":done:pr_sat_strict_unbounded" >> cvc5-fmf_us_sat.log
echo "done pr_sat_strict_unbounded"
echo ":model:rl_a_sat_strict_unbounded:us:0:33" >> cvc5-fmf_us_sat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 rl_a_sat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_sat.log
echo ":done:rl_a_sat_strict_unbounded" >> cvc5-fmf_us_sat.log
echo "done rl_a_sat_strict_unbounded"
echo ":model:rl_b_sat_strict_unbounded:us:0:33" >> cvc5-fmf_us_sat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 rl_b_sat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_sat.log
echo ":done:rl_b_sat_strict_unbounded" >> cvc5-fmf_us_sat.log
echo "done rl_b_sat_strict_unbounded"
echo ":model:rl_c_sat_strict_unbounded:us:0:20" >> cvc5-fmf_us_sat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 rl_c_sat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_sat.log
echo ":done:rl_c_sat_strict_unbounded" >> cvc5-fmf_us_sat.log
echo "done rl_c_sat_strict_unbounded"
echo ":model:student_sat_strict_unbounded:us:0:6" >> cvc5-fmf_us_sat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 student_sat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_sat.log
echo ":done:student_sat_strict_unbounded" >> cvc5-fmf_us_sat.log
echo "done student_sat_strict_unbounded"
echo ":model:transport_sat_strict_unbounded:us:0:2" >> cvc5-fmf_us_sat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 transport_sat_strict_unbounded.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> cvc5-fmf_us_sat.log
echo ":done:transport_sat_strict_unbounded" >> cvc5-fmf_us_sat.log
echo "done transport_sat_strict_unbounded"
