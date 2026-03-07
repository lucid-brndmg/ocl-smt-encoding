
echo ":model:am_unsat_f_6:b:12:4" >> z3_b6_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 am_unsat_f_6.smt2 -st -T:3600 &>> z3_b6_unsat.log
echo ":done:am_unsat_f_6" >> z3_b6_unsat.log
echo "done am_unsat_f_6"
echo ":model:car_rental_unsat_f_6:b:54:12" >> z3_b6_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 car_rental_unsat_f_6.smt2 -st -T:3600 &>> z3_b6_unsat.log
echo ":done:car_rental_unsat_f_6" >> z3_b6_unsat.log
echo "done car_rental_unsat_f_6"
echo ":model:ds_unsat_f_6:b:24:1" >> z3_b6_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 ds_unsat_f_6.smt2 -st -T:3600 &>> z3_b6_unsat.log
echo ":done:ds_unsat_f_6" >> z3_b6_unsat.log
echo "done ds_unsat_f_6"
echo ":model:ehr_a_unsat_f_6:b:54:22" >> z3_b6_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 ehr_a_unsat_f_6.smt2 -st -T:3600 &>> z3_b6_unsat.log
echo ":done:ehr_a_unsat_f_6" >> z3_b6_unsat.log
echo "done ehr_a_unsat_f_6"
echo ":model:pr_unsat_unsat_f_6:b:12:5" >> z3_b6_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 pr_unsat_unsat_f_6.smt2 -st -T:3600 &>> z3_b6_unsat.log
echo ":done:pr_unsat_unsat_f_6" >> z3_b6_unsat.log
echo "done pr_unsat_unsat_f_6"
echo ":model:rl_a_unsat_f_6:b:108:44" >> z3_b6_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 rl_a_unsat_f_6.smt2 -st -T:3600 &>> z3_b6_unsat.log
echo ":done:rl_a_unsat_f_6" >> z3_b6_unsat.log
echo "done rl_a_unsat_f_6"
echo ":model:rl_b_unsat_f_6:b:78:44" >> z3_b6_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 rl_b_unsat_f_6.smt2 -st -T:3600 &>> z3_b6_unsat.log
echo ":done:rl_b_unsat_f_6" >> z3_b6_unsat.log
echo "done rl_b_unsat_f_6"
echo ":model:rl_c_unsat_f_6:b:96:26" >> z3_b6_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 rl_c_unsat_f_6.smt2 -st -T:3600 &>> z3_b6_unsat.log
echo ":done:rl_c_unsat_f_6" >> z3_b6_unsat.log
echo "done rl_c_unsat_f_6"
echo ":model:student_unsat_f_6:b:36:8" >> z3_b6_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 student_unsat_f_6.smt2 -st -T:3600 &>> z3_b6_unsat.log
echo ":done:student_unsat_f_6" >> z3_b6_unsat.log
echo "done student_unsat_f_6"
echo ":model:transport_unsat_f_6:b:18:4" >> z3_b6_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 transport_unsat_f_6.smt2 -st -T:3600 &>> z3_b6_unsat.log
echo ":done:transport_unsat_f_6" >> z3_b6_unsat.log
echo "done transport_unsat_f_6"
