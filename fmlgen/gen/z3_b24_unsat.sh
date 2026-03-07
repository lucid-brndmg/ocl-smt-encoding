
echo ":model:am_unsat_f_24:b:48:4" >> z3_b24_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 am_unsat_f_24.smt2 -st -T:3600 &>> z3_b24_unsat.log
echo ":done:am_unsat_f_24" >> z3_b24_unsat.log
echo "done am_unsat_f_24"
echo ":model:car_rental_unsat_f_24:b:216:12" >> z3_b24_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 car_rental_unsat_f_24.smt2 -st -T:3600 &>> z3_b24_unsat.log
echo ":done:car_rental_unsat_f_24" >> z3_b24_unsat.log
echo "done car_rental_unsat_f_24"
echo ":model:ds_unsat_f_24:b:96:1" >> z3_b24_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 ds_unsat_f_24.smt2 -st -T:3600 &>> z3_b24_unsat.log
echo ":done:ds_unsat_f_24" >> z3_b24_unsat.log
echo "done ds_unsat_f_24"
echo ":model:ehr_a_unsat_f_24:b:216:22" >> z3_b24_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 ehr_a_unsat_f_24.smt2 -st -T:3600 &>> z3_b24_unsat.log
echo ":done:ehr_a_unsat_f_24" >> z3_b24_unsat.log
echo "done ehr_a_unsat_f_24"
echo ":model:pr_unsat_unsat_f_24:b:48:5" >> z3_b24_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 pr_unsat_unsat_f_24.smt2 -st -T:3600 &>> z3_b24_unsat.log
echo ":done:pr_unsat_unsat_f_24" >> z3_b24_unsat.log
echo "done pr_unsat_unsat_f_24"
echo ":model:rl_b_unsat_f_24:b:312:44" >> z3_b24_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 rl_b_unsat_f_24.smt2 -st -T:3600 &>> z3_b24_unsat.log
echo ":done:rl_b_unsat_f_24" >> z3_b24_unsat.log
echo "done rl_b_unsat_f_24"
echo ":model:student_unsat_f_24:b:144:8" >> z3_b24_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 student_unsat_f_24.smt2 -st -T:3600 &>> z3_b24_unsat.log
echo ":done:student_unsat_f_24" >> z3_b24_unsat.log
echo "done student_unsat_f_24"
echo ":model:transport_unsat_f_24:b:72:4" >> z3_b24_unsat.log
systemd-run --scope -p MemoryMax=16G --user z3 transport_unsat_f_24.smt2 -st -T:3600 &>> z3_b24_unsat.log
echo ":done:transport_unsat_f_24" >> z3_b24_unsat.log
echo "done transport_unsat_f_24"
