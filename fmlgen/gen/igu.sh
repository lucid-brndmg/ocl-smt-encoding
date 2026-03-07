echo ":model:company_worker_sat_strict_unbounded_ig10.smt2:cw:10:0" >> ig_unbounded.log
systemd-run --scope -p MemoryMax=16G --user cvc5 company_worker_sat_strict_unbounded_ig10.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> ig_unbounded.log
echo ":done:company_worker_sat_strict_unbounded_ig10" >> ig_unbounded.log
echo "done company_worker_sat_strict_unbounded_ig10"
echo ":model:cs_sat_strict_unbounded_ig10.smt2:cs:10:0" >> ig_unbounded.log
systemd-run --scope -p MemoryMax=16G --user cvc5 cs_sat_strict_unbounded_ig10.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> ig_unbounded.log
echo ":done:cs_sat_strict_unbounded_ig10" >> ig_unbounded.log
echo "done cs_sat_strict_unbounded_ig10"
echo ":model:ehr_a_sat_strict_unbounded_ig10.smt2:ehr:10:0" >> ig_unbounded.log
systemd-run --scope -p MemoryMax=16G --user cvc5 ehr_a_sat_strict_unbounded_ig10.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> ig_unbounded.log
echo ":done:ehr_a_sat_strict_unbounded_ig10" >> ig_unbounded.log
echo "done ehr_a_sat_strict_unbounded_ig10"
echo ":model:percom_sat_strict_unbounded_ig10.smt2:percom:10:0" >> ig_unbounded.log
systemd-run --scope -p MemoryMax=16G --user cvc5 percom_sat_strict_unbounded_ig10.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> ig_unbounded.log
echo ":done:percom_sat_strict_unbounded_ig10" >> ig_unbounded.log
echo "done percom_sat_strict_unbounded_ig10"
echo ":model:transport_sat_strict_unbounded_ig10.smt2:transport:10:0" >> ig_unbounded.log
systemd-run --scope -p MemoryMax=16G --user cvc5 transport_sat_strict_unbounded_ig10.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> ig_unbounded.log
echo ":done:transport_sat_strict_unbounded_ig10" >> ig_unbounded.log
echo "done transport_sat_strict_unbounded_ig10"
echo ":model:rl_c_sat_strict_unbounded_ig10.smt2:rl_c:10:0" >> ig_unbounded.log
systemd-run --scope -p MemoryMax=16G --user cvc5 rl_c_sat_strict_unbounded_ig10.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> ig_unbounded.log
echo ":done:rl_c_sat_strict_unbounded_ig10" >> ig_unbounded.log
echo "done rl_c_sat_strict_unbounded_ig10"
echo ":model:company_worker_sat_strict_unbounded_ig25.smt2:cw:25:0" >> ig_unbounded.log
systemd-run --scope -p MemoryMax=16G --user cvc5 company_worker_sat_strict_unbounded_ig25.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> ig_unbounded.log
echo ":done:company_worker_sat_strict_unbounded_ig25" >> ig_unbounded.log
echo "done company_worker_sat_strict_unbounded_ig25"
echo ":model:cs_sat_strict_unbounded_ig25.smt2:cs:25:0" >> ig_unbounded.log
systemd-run --scope -p MemoryMax=16G --user cvc5 cs_sat_strict_unbounded_ig25.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> ig_unbounded.log
echo ":done:cs_sat_strict_unbounded_ig25" >> ig_unbounded.log
echo "done cs_sat_strict_unbounded_ig25"
echo ":model:ehr_a_sat_strict_unbounded_ig25.smt2:ehr:25:0" >> ig_unbounded.log
systemd-run --scope -p MemoryMax=16G --user cvc5 ehr_a_sat_strict_unbounded_ig25.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> ig_unbounded.log
echo ":done:ehr_a_sat_strict_unbounded_ig25" >> ig_unbounded.log
echo "done ehr_a_sat_strict_unbounded_ig25"
echo ":model:percom_sat_strict_unbounded_ig25.smt2:percom:25:0" >> ig_unbounded.log
systemd-run --scope -p MemoryMax=16G --user cvc5 percom_sat_strict_unbounded_ig25.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> ig_unbounded.log
echo ":done:percom_sat_strict_unbounded_ig25" >> ig_unbounded.log
echo "done percom_sat_strict_unbounded_ig25"
echo ":model:transport_sat_strict_unbounded_ig25.smt2:transport:25:0" >> ig_unbounded.log
systemd-run --scope -p MemoryMax=16G --user cvc5 transport_sat_strict_unbounded_ig25.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> ig_unbounded.log
echo ":done:transport_sat_strict_unbounded_ig25" >> ig_unbounded.log
echo "done transport_sat_strict_unbounded_ig25"
echo ":model:rl_c_sat_strict_unbounded_ig25.smt2:rl_c:25:0" >> ig_unbounded.log
systemd-run --scope -p MemoryMax=16G --user cvc5 rl_c_sat_strict_unbounded_ig25.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> ig_unbounded.log
echo ":done:rl_c_sat_strict_unbounded_ig25" >> ig_unbounded.log
echo "done rl_c_sat_strict_unbounded_ig25"
echo ":model:company_worker_sat_strict_unbounded_ig50.smt2:cw:50:0" >> ig_unbounded.log
systemd-run --scope -p MemoryMax=16G --user cvc5 company_worker_sat_strict_unbounded_ig50.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> ig_unbounded.log
echo ":done:company_worker_sat_strict_unbounded_ig50" >> ig_unbounded.log
echo "done company_worker_sat_strict_unbounded_ig50"
echo ":model:cs_sat_strict_unbounded_ig50.smt2:cs:50:0" >> ig_unbounded.log
systemd-run --scope -p MemoryMax=16G --user cvc5 cs_sat_strict_unbounded_ig50.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> ig_unbounded.log
echo ":done:cs_sat_strict_unbounded_ig50" >> ig_unbounded.log
echo "done cs_sat_strict_unbounded_ig50"
echo ":model:ehr_a_sat_strict_unbounded_ig50.smt2:ehr:50:0" >> ig_unbounded.log
systemd-run --scope -p MemoryMax=16G --user cvc5 ehr_a_sat_strict_unbounded_ig50.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> ig_unbounded.log
echo ":done:ehr_a_sat_strict_unbounded_ig50" >> ig_unbounded.log
echo "done ehr_a_sat_strict_unbounded_ig50"
echo ":model:percom_sat_strict_unbounded_ig50.smt2:percom:50:0" >> ig_unbounded.log
systemd-run --scope -p MemoryMax=16G --user cvc5 percom_sat_strict_unbounded_ig50.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> ig_unbounded.log
echo ":done:percom_sat_strict_unbounded_ig50" >> ig_unbounded.log
echo "done percom_sat_strict_unbounded_ig50"
echo ":model:transport_sat_strict_unbounded_ig50.smt2:transport:50:0" >> ig_unbounded.log
systemd-run --scope -p MemoryMax=16G --user cvc5 transport_sat_strict_unbounded_ig50.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> ig_unbounded.log
echo ":done:transport_sat_strict_unbounded_ig50" >> ig_unbounded.log
echo "done transport_sat_strict_unbounded_ig50"
echo ":model:rl_c_sat_strict_unbounded_ig50.smt2:rl_c:50:0" >> ig_unbounded.log
systemd-run --scope -p MemoryMax=16G --user cvc5 rl_c_sat_strict_unbounded_ig50.smt2 --finite-model-find --stats --tlimit 3600000 --err stdout &>> ig_unbounded.log
echo ":done:rl_c_sat_strict_unbounded_ig50" >> ig_unbounded.log
echo "done rl_c_sat_strict_unbounded_ig50"