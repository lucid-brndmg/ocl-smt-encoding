
echo ":model:am_unsat_strict_unbounded:us:0:4" >> z3_us_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 am_unsat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_unsat.log
echo ":done:am_unsat_strict_unbounded" >> z3_us_unsat.log
echo "done am_unsat_strict_unbounded"
echo ":model:car_rental_unsat_strict_unbounded:us:0:12" >> z3_us_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 car_rental_unsat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_unsat.log
echo ":done:car_rental_unsat_strict_unbounded" >> z3_us_unsat.log
echo "done car_rental_unsat_strict_unbounded"
echo ":model:ds_unsat_strict_unbounded:us:0:1" >> z3_us_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 ds_unsat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_unsat.log
echo ":done:ds_unsat_strict_unbounded" >> z3_us_unsat.log
echo "done ds_unsat_strict_unbounded"
echo ":model:ehr_a_unsat_strict_unbounded:us:0:22" >> z3_us_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 ehr_a_unsat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_unsat.log
echo ":done:ehr_a_unsat_strict_unbounded" >> z3_us_unsat.log
echo "done ehr_a_unsat_strict_unbounded"
echo ":model:pr_unsat_strict_unbounded:us:0:5" >> z3_us_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 pr_unsat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_unsat.log
echo ":done:pr_unsat_strict_unbounded" >> z3_us_unsat.log
echo "done pr_unsat_strict_unbounded"
echo ":model:rl_a_unsat_strict_unbounded:us:0:37" >> z3_us_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 rl_a_unsat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_unsat.log
echo ":done:rl_a_unsat_strict_unbounded" >> z3_us_unsat.log
echo "done rl_a_unsat_strict_unbounded"
echo ":model:rl_b_unsat_strict_unbounded:us:0:37" >> z3_us_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 rl_b_unsat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_unsat.log
echo ":done:rl_b_unsat_strict_unbounded" >> z3_us_unsat.log
echo "done rl_b_unsat_strict_unbounded"
echo ":model:rl_c_unsat_strict_unbounded:us:0:21" >> z3_us_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 rl_c_unsat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_unsat.log
echo ":done:rl_c_unsat_strict_unbounded" >> z3_us_unsat.log
echo "done rl_c_unsat_strict_unbounded"
echo ":model:student_unsat_strict_unbounded:us:0:8" >> z3_us_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 student_unsat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_unsat.log
echo ":done:student_unsat_strict_unbounded" >> z3_us_unsat.log
echo "done student_unsat_strict_unbounded"
echo ":model:transport_unsat_strict_unbounded:us:0:3" >> z3_us_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 transport_unsat_strict_unbounded.smt2 -st -T:3600 &>> z3_us_unsat.log
echo ":done:transport_unsat_strict_unbounded" >> z3_us_unsat.log
echo "done transport_unsat_strict_unbounded"
