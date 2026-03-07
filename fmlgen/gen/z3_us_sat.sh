
echo ":model:ae_dep_sat_strict_unbounded:us:0:10" >> z3_us_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 ae_dep_sat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_sat.log
echo ":done:ae_dep_sat_strict_unbounded" >> z3_us_sat.log
echo "done ae_dep_sat_strict_unbounded"
echo ":model:am_sat_strict_unbounded:us:0:3" >> z3_us_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 am_sat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_sat.log
echo ":done:am_sat_strict_unbounded" >> z3_us_sat.log
echo "done am_sat_strict_unbounded"
echo ":model:car_dealer_sat_strict_unbounded:us:0:8" >> z3_us_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 car_dealer_sat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_sat.log
echo ":done:car_dealer_sat_strict_unbounded" >> z3_us_sat.log
echo "done car_dealer_sat_strict_unbounded"
echo ":model:car_rental_sat_strict_unbounded:us:0:11" >> z3_us_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 car_rental_sat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_sat.log
echo ":done:car_rental_sat_strict_unbounded" >> z3_us_sat.log
echo "done car_rental_sat_strict_unbounded"
echo ":model:company_worker_sat_strict_unbounded:us:0:4" >> z3_us_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 company_worker_sat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_sat.log
echo ":done:company_worker_sat_strict_unbounded" >> z3_us_sat.log
echo "done company_worker_sat_strict_unbounded"
echo ":model:cs_sat_strict_unbounded:us:0:6" >> z3_us_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 cs_sat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_sat.log
echo ":done:cs_sat_strict_unbounded" >> z3_us_sat.log
echo "done cs_sat_strict_unbounded"
echo ":model:dblp_sat_strict_unbounded:us:0:24" >> z3_us_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 dblp_sat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_sat.log
echo ":done:dblp_sat_strict_unbounded" >> z3_us_sat.log
echo "done dblp_sat_strict_unbounded"
echo ":model:ds_sat_strict_unbounded:us:0:0" >> z3_us_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 ds_sat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_sat.log
echo ":done:ds_sat_strict_unbounded" >> z3_us_sat.log
echo "done ds_sat_strict_unbounded"
echo ":model:ehr_a_sat_strict_unbounded:us:0:21" >> z3_us_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 ehr_a_sat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_sat.log
echo ":done:ehr_a_sat_strict_unbounded" >> z3_us_sat.log
echo "done ehr_a_sat_strict_unbounded"
echo ":model:percom_sat_strict_unbounded:us:0:5" >> z3_us_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 percom_sat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_sat.log
echo ":done:percom_sat_strict_unbounded" >> z3_us_sat.log
echo "done percom_sat_strict_unbounded"
echo ":model:pr_sat_strict_unbounded:us:0:4" >> z3_us_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 pr_sat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_sat.log
echo ":done:pr_sat_strict_unbounded" >> z3_us_sat.log
echo "done pr_sat_strict_unbounded"
echo ":model:rl_a_sat_strict_unbounded:us:0:33" >> z3_us_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 rl_a_sat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_sat.log
echo ":done:rl_a_sat_strict_unbounded" >> z3_us_sat.log
echo "done rl_a_sat_strict_unbounded"
echo ":model:rl_b_sat_strict_unbounded:us:0:33" >> z3_us_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 rl_b_sat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_sat.log
echo ":done:rl_b_sat_strict_unbounded" >> z3_us_sat.log
echo "done rl_b_sat_strict_unbounded"
echo ":model:rl_c_sat_strict_unbounded:us:0:20" >> z3_us_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 rl_c_sat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_sat.log
echo ":done:rl_c_sat_strict_unbounded" >> z3_us_sat.log
echo "done rl_c_sat_strict_unbounded"
echo ":model:student_sat_strict_unbounded:us:0:6" >> z3_us_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 student_sat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_sat.log
echo ":done:student_sat_strict_unbounded" >> z3_us_sat.log
echo "done student_sat_strict_unbounded"
echo ":model:transport_sat_strict_unbounded:us:0:2" >> z3_us_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 transport_sat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_sat.log
echo ":done:transport_sat_strict_unbounded" >> z3_us_sat.log
echo "done transport_sat_strict_unbounded"
