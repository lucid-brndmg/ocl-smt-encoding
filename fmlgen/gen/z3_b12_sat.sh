
echo ":model:ae_dep_sat_f_12:b:144:10" >> z3_b12_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 ae_dep_sat_f_12.smt2 -st -T:3600 &>> z3_b12_sat.log
echo ":done:ae_dep_sat_f_12" >> z3_b12_sat.log
echo "done ae_dep_sat_f_12"
echo ":model:am_sat_f_12:b:24:3" >> z3_b12_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 am_sat_f_12.smt2 -st -T:3600 &>> z3_b12_sat.log
echo ":done:am_sat_f_12" >> z3_b12_sat.log
echo "done am_sat_f_12"
echo ":model:bart_model_nodiv0_sat_f_12:b:72:10" >> z3_b12_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 bart_model_nodiv0_sat_f_12.smt2 -st -T:3600 &>> z3_b12_sat.log
echo ":done:bart_model_nodiv0_sat_f_12" >> z3_b12_sat.log
echo "done bart_model_nodiv0_sat_f_12"
echo ":model:car_dealer_sat_f_12:b:24:9" >> z3_b12_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 car_dealer_sat_f_12.smt2 -st -T:3600 &>> z3_b12_sat.log
echo ":done:car_dealer_sat_f_12" >> z3_b12_sat.log
echo "done car_dealer_sat_f_12"
echo ":model:car_rental_sat_f_12:b:108:11" >> z3_b12_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 car_rental_sat_f_12.smt2 -st -T:3600 &>> z3_b12_sat.log
echo ":done:car_rental_sat_f_12" >> z3_b12_sat.log
echo "done car_rental_sat_f_12"
echo ":model:company_worker_sat_f_12:b:24:4" >> z3_b12_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 company_worker_sat_f_12.smt2 -st -T:3600 &>> z3_b12_sat.log
echo ":done:company_worker_sat_f_12" >> z3_b12_sat.log
echo "done company_worker_sat_f_12"
echo ":model:cs_sat_f_12:b:12:6" >> z3_b12_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 cs_sat_f_12.smt2 -st -T:3600 &>> z3_b12_sat.log
echo ":done:cs_sat_f_12" >> z3_b12_sat.log
echo "done cs_sat_f_12"
echo ":model:dblp_sat_f_12:b:204:25" >> z3_b12_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 dblp_sat_f_12.smt2 -st -T:3600 &>> z3_b12_sat.log
echo ":done:dblp_sat_f_12" >> z3_b12_sat.log
echo "done dblp_sat_f_12"
echo ":model:ds_sat_f_12:b:48:0" >> z3_b12_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 ds_sat_f_12.smt2 -st -T:3600 &>> z3_b12_sat.log
echo ":done:ds_sat_f_12" >> z3_b12_sat.log
echo "done ds_sat_f_12"
echo ":model:ehr_a_sat_f_12:b:108:21" >> z3_b12_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 ehr_a_sat_f_12.smt2 -st -T:3600 &>> z3_b12_sat.log
echo ":done:ehr_a_sat_f_12" >> z3_b12_sat.log
echo "done ehr_a_sat_f_12"
echo ":model:ex_sat_f_12:b:36:7" >> z3_b12_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 ex_sat_f_12.smt2 -st -T:3600 &>> z3_b12_sat.log
echo ":done:ex_sat_f_12" >> z3_b12_sat.log
echo "done ex_sat_f_12"
echo ":model:oai_sat_f_12:b:48:7" >> z3_b12_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 oai_sat_f_12.smt2 -st -T:3600 &>> z3_b12_sat.log
echo ":done:oai_sat_f_12" >> z3_b12_sat.log
echo "done oai_sat_f_12"
echo ":model:percom_sat_f_12:b:36:6" >> z3_b12_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 percom_sat_f_12.smt2 -st -T:3600 &>> z3_b12_sat.log
echo ":done:percom_sat_f_12" >> z3_b12_sat.log
echo "done percom_sat_f_12"
echo ":model:pr_sat_sat_f_12:b:24:4" >> z3_b12_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 pr_sat_sat_f_12.smt2 -st -T:3600 &>> z3_b12_sat.log
echo ":done:pr_sat_sat_f_12" >> z3_b12_sat.log
echo "done pr_sat_sat_f_12"
echo ":model:rl_a_sat_f_12:b:288:40" >> z3_b12_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 rl_a_sat_f_12.smt2 -st -T:3600 &>> z3_b12_sat.log
echo ":done:rl_a_sat_f_12" >> z3_b12_sat.log
echo "done rl_a_sat_f_12"
echo ":model:rl_b_sat_f_12:b:156:40" >> z3_b12_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 rl_b_sat_f_12.smt2 -st -T:3600 &>> z3_b12_sat.log
echo ":done:rl_b_sat_f_12" >> z3_b12_sat.log
echo "done rl_b_sat_f_12"
echo ":model:rl_c_sat_f_12:b:264:25" >> z3_b12_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 rl_c_sat_f_12.smt2 -st -T:3600 &>> z3_b12_sat.log
echo ":done:rl_c_sat_f_12" >> z3_b12_sat.log
echo "done rl_c_sat_f_12"
echo ":model:student_sat_f_12:b:72:6" >> z3_b12_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 student_sat_f_12.smt2 -st -T:3600 &>> z3_b12_sat.log
echo ":done:student_sat_f_12" >> z3_b12_sat.log
echo "done student_sat_f_12"
echo ":model:train_sat_f_12:b:72:7" >> z3_b12_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 train_sat_f_12.smt2 -st -T:3600 &>> z3_b12_sat.log
echo ":done:train_sat_f_12" >> z3_b12_sat.log
echo "done train_sat_f_12"
echo ":model:transport_sat_f_12:b:36:2" >> z3_b12_sat.log
systemd-run --scope -p MemoryMax=16G --user z3 transport_sat_f_12.smt2 -st -T:3600 &>> z3_b12_sat.log
echo ":done:transport_sat_f_12" >> z3_b12_sat.log
echo "done transport_sat_f_12"
