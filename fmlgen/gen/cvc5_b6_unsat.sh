
echo ":model:am_unsat_f_6:b:12:4" >> cvc5_b6_unsat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 am_unsat_f_6.smt2 --stats --tlimit 3600000 --err stdout &>> cvc5_b6_unsat.log
echo ":done:am_unsat_f_6" >> cvc5_b6_unsat.log
echo "done am_unsat_f_6"
echo ":model:car_rental_unsat_f_6:b:54:12" >> cvc5_b6_unsat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 car_rental_unsat_f_6.smt2 --stats --tlimit 3600000 --err stdout &>> cvc5_b6_unsat.log
echo ":done:car_rental_unsat_f_6" >> cvc5_b6_unsat.log
echo "done car_rental_unsat_f_6"
echo ":model:ds_unsat_f_6:b:24:1" >> cvc5_b6_unsat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 ds_unsat_f_6.smt2 --stats --tlimit 3600000 --err stdout &>> cvc5_b6_unsat.log
echo ":done:ds_unsat_f_6" >> cvc5_b6_unsat.log
echo "done ds_unsat_f_6"
echo ":model:ehr_a_unsat_f_6:b:54:22" >> cvc5_b6_unsat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 ehr_a_unsat_f_6.smt2 --stats --tlimit 3600000 --err stdout &>> cvc5_b6_unsat.log
echo ":done:ehr_a_unsat_f_6" >> cvc5_b6_unsat.log
echo "done ehr_a_unsat_f_6"
echo ":model:pr_unsat_unsat_f_6:b:12:5" >> cvc5_b6_unsat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 pr_unsat_unsat_f_6.smt2 --stats --tlimit 3600000 --err stdout &>> cvc5_b6_unsat.log
echo ":done:pr_unsat_unsat_f_6" >> cvc5_b6_unsat.log
echo "done pr_unsat_unsat_f_6"
echo ":model:rl_a_unsat_f_6:b:108:44" >> cvc5_b6_unsat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 rl_a_unsat_f_6.smt2 --stats --tlimit 3600000 --err stdout &>> cvc5_b6_unsat.log
echo ":done:rl_a_unsat_f_6" >> cvc5_b6_unsat.log
echo "done rl_a_unsat_f_6"
echo ":model:rl_b_unsat_f_6:b:78:44" >> cvc5_b6_unsat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 rl_b_unsat_f_6.smt2 --stats --tlimit 3600000 --err stdout &>> cvc5_b6_unsat.log
echo ":done:rl_b_unsat_f_6" >> cvc5_b6_unsat.log
echo "done rl_b_unsat_f_6"
echo ":model:rl_c_unsat_f_6:b:96:26" >> cvc5_b6_unsat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 rl_c_unsat_f_6.smt2 --stats --tlimit 3600000 --err stdout &>> cvc5_b6_unsat.log
echo ":done:rl_c_unsat_f_6" >> cvc5_b6_unsat.log
echo "done rl_c_unsat_f_6"
echo ":model:student_unsat_f_6:b:36:8" >> cvc5_b6_unsat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 student_unsat_f_6.smt2 --stats --tlimit 3600000 --err stdout &>> cvc5_b6_unsat.log
echo ":done:student_unsat_f_6" >> cvc5_b6_unsat.log
echo "done student_unsat_f_6"
echo ":model:transport_unsat_f_6:b:18:4" >> cvc5_b6_unsat.log
systemd-run --scope -p MemoryMax=16G --user cvc5 transport_unsat_f_6.smt2 --stats --tlimit 3600000 --err stdout &>> cvc5_b6_unsat.log
echo ":done:transport_unsat_f_6" >> cvc5_b6_unsat.log
echo "done transport_unsat_f_6"
