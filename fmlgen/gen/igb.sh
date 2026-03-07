echo ":model:company_worker_sat_f_5_ig10.smt2:cw:10:15" >> ig_bounded.log
systemd-run --scope -p MemoryMax=16G --user z3 company_worker_sat_f_5_ig10.smt2 -st -T:3600 &>> ig_bounded.log
echo ":done:company_worker_sat_f_5_ig10" >> ig_bounded.log
echo "done company_worker_sat_f_5_ig10"
echo ":model:cs_sat_f_5_ig10.smt2:cs:10:10" >> ig_bounded.log
systemd-run --scope -p MemoryMax=16G --user z3 cs_sat_f_5_ig10.smt2 -st -T:3600 &>> ig_bounded.log
echo ":done:cs_sat_f_5_ig10" >> ig_bounded.log
echo "done cs_sat_f_5_ig10"
echo ":model:ehr_a_sat_f_5_ig10.smt2:ehr:10:50" >> ig_bounded.log
systemd-run --scope -p MemoryMax=16G --user z3 ehr_a_sat_f_5_ig10.smt2 -st -T:3600 &>> ig_bounded.log
echo ":done:ehr_a_sat_f_5_ig10" >> ig_bounded.log
echo "done ehr_a_sat_f_5_ig10"
echo ":model:percom_sat_f_5_ig10.smt2:percom:10:20" >> ig_bounded.log
systemd-run --scope -p MemoryMax=16G --user z3 percom_sat_f_5_ig10.smt2 -st -T:3600 &>> ig_bounded.log
echo ":done:percom_sat_f_5_ig10" >> ig_bounded.log
echo "done percom_sat_f_5_ig10"
echo ":model:transport_sat_f_5_ig10.smt2:transport:10:20" >> ig_bounded.log
systemd-run --scope -p MemoryMax=16G --user z3 transport_sat_f_5_ig10.smt2 -st -T:3600 &>> ig_bounded.log
echo ":done:transport_sat_f_5_ig10" >> ig_bounded.log
echo "done transport_sat_f_5_ig10"
echo ":model:bart_model_nodiv0_sat_f_5_ig10.smt2:bart:10:35" >> ig_bounded.log
systemd-run --scope -p MemoryMax=16G --user z3 bart_model_nodiv0_sat_f_5_ig10.smt2 -st -T:3600 &>> ig_bounded.log
echo ":done:bart_model_nodiv0_sat_f_5_ig10" >> ig_bounded.log
echo "done bart_model_nodiv0_sat_f_5_ig10"
echo ":model:rl_c_sat_f_5_ig10.smt2:rl_c:10:105" >> ig_bounded.log
systemd-run --scope -p MemoryMax=16G --user z3 rl_c_sat_f_5_ig10.smt2 -st -T:3600 &>> ig_bounded.log
echo ":done:rl_c_sat_f_5_ig10" >> ig_bounded.log
echo "done rl_c_sat_f_5_ig10"
echo ":model:company_worker_sat_f_5_ig25.smt2:cw:25:30" >> ig_bounded.log
systemd-run --scope -p MemoryMax=16G --user z3 company_worker_sat_f_5_ig25.smt2 -st -T:3600 &>> ig_bounded.log
echo ":done:company_worker_sat_f_5_ig25" >> ig_bounded.log
echo "done company_worker_sat_f_5_ig25"
echo ":model:cs_sat_f_5_ig25.smt2:cs:25:25" >> ig_bounded.log
systemd-run --scope -p MemoryMax=16G --user z3 cs_sat_f_5_ig25.smt2 -st -T:3600 &>> ig_bounded.log
echo ":done:cs_sat_f_5_ig25" >> ig_bounded.log
echo "done cs_sat_f_5_ig25"
echo ":model:ehr_a_sat_f_5_ig25.smt2:ehr:25:65" >> ig_bounded.log
systemd-run --scope -p MemoryMax=16G --user z3 ehr_a_sat_f_5_ig25.smt2 -st -T:3600 &>> ig_bounded.log
echo ":done:ehr_a_sat_f_5_ig25" >> ig_bounded.log
echo "done ehr_a_sat_f_5_ig25"
echo ":model:percom_sat_f_5_ig25.smt2:percom:25:35" >> ig_bounded.log
systemd-run --scope -p MemoryMax=16G --user z3 percom_sat_f_5_ig25.smt2 -st -T:3600 &>> ig_bounded.log
echo ":done:percom_sat_f_5_ig25" >> ig_bounded.log
echo "done percom_sat_f_5_ig25"
echo ":model:transport_sat_f_5_ig25.smt2:transport:25:35" >> ig_bounded.log
systemd-run --scope -p MemoryMax=16G --user z3 transport_sat_f_5_ig25.smt2 -st -T:3600 &>> ig_bounded.log
echo ":done:transport_sat_f_5_ig25" >> ig_bounded.log
echo "done transport_sat_f_5_ig25"
echo ":model:bart_model_nodiv0_sat_f_5_ig25.smt2:bart:25:50" >> ig_bounded.log
systemd-run --scope -p MemoryMax=16G --user z3 bart_model_nodiv0_sat_f_5_ig25.smt2 -st -T:3600 &>> ig_bounded.log
echo ":done:bart_model_nodiv0_sat_f_5_ig25" >> ig_bounded.log
echo "done bart_model_nodiv0_sat_f_5_ig25"
echo ":model:rl_c_sat_f_5_ig25.smt2:rl_c:25:195" >> ig_bounded.log
systemd-run --scope -p MemoryMax=16G --user z3 rl_c_sat_f_5_ig25.smt2 -st -T:3600 &>> ig_bounded.log
echo ":done:rl_c_sat_f_5_ig25" >> ig_bounded.log
echo "done rl_c_sat_f_5_ig25"
echo ":model:company_worker_sat_f_5_ig50.smt2:cw:50:55" >> ig_bounded.log
systemd-run --scope -p MemoryMax=16G --user z3 company_worker_sat_f_5_ig50.smt2 -st -T:3600 &>> ig_bounded.log
echo ":done:company_worker_sat_f_5_ig50" >> ig_bounded.log
echo "done company_worker_sat_f_5_ig50"
echo ":model:cs_sat_f_5_ig50.smt2:cs:50:50" >> ig_bounded.log
systemd-run --scope -p MemoryMax=16G --user z3 cs_sat_f_5_ig50.smt2 -st -T:3600 &>> ig_bounded.log
echo ":done:cs_sat_f_5_ig50" >> ig_bounded.log
echo "done cs_sat_f_5_ig50"
echo ":model:ehr_a_sat_f_5_ig50.smt2:ehr:50:90" >> ig_bounded.log
systemd-run --scope -p MemoryMax=16G --user z3 ehr_a_sat_f_5_ig50.smt2 -st -T:3600 &>> ig_bounded.log
echo ":done:ehr_a_sat_f_5_ig50" >> ig_bounded.log
echo "done ehr_a_sat_f_5_ig50"
echo ":model:percom_sat_f_5_ig50.smt2:percom:50:60" >> ig_bounded.log
systemd-run --scope -p MemoryMax=16G --user z3 percom_sat_f_5_ig50.smt2 -st -T:3600 &>> ig_bounded.log
echo ":done:percom_sat_f_5_ig50" >> ig_bounded.log
echo "done percom_sat_f_5_ig50"
echo ":model:transport_sat_f_5_ig50.smt2:transport:50:60" >> ig_bounded.log
systemd-run --scope -p MemoryMax=16G --user z3 transport_sat_f_5_ig50.smt2 -st -T:3600 &>> ig_bounded.log
echo ":done:transport_sat_f_5_ig50" >> ig_bounded.log
echo "done transport_sat_f_5_ig50"
echo ":model:bart_model_nodiv0_sat_f_5_ig50.smt2:bart:50:75" >> ig_bounded.log
systemd-run --scope -p MemoryMax=16G --user z3 bart_model_nodiv0_sat_f_5_ig50.smt2 -st -T:3600 &>> ig_bounded.log
echo ":done:bart_model_nodiv0_sat_f_5_ig50" >> ig_bounded.log
echo "done bart_model_nodiv0_sat_f_5_ig50"
echo ":model:rl_c_sat_f_5_ig50.smt2:rl_c:50:345" >> ig_bounded.log
systemd-run --scope -p MemoryMax=16G --user z3 rl_c_sat_f_5_ig50.smt2 -st -T:3600 &>> ig_bounded.log
echo ":done:rl_c_sat_f_5_ig50" >> ig_bounded.log
echo "done rl_c_sat_f_5_ig50"