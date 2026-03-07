cd gen
MARCO_EXEC="python3 $HOME/MARCO/marco.py"

echo ":model:am_unsat_f_6:b:12:4" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC am_unsat_f_6.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:am_unsat_f_6" >> marco.log
echo "done am_unsat_f_6"
echo ":model:car_rental_unsat_f_6:b:54:12" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC car_rental_unsat_f_6.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:car_rental_unsat_f_6" >> marco.log
echo "done car_rental_unsat_f_6"
echo ":model:ds_unsat_f_6:b:24:1" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC ds_unsat_f_6.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:ds_unsat_f_6" >> marco.log
echo "done ds_unsat_f_6"
echo ":model:ehr_a_unsat_f_6:b:54:22" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC ehr_a_unsat_f_6.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:ehr_a_unsat_f_6" >> marco.log
echo "done ehr_a_unsat_f_6"
echo ":model:pr_unsat_unsat_f_6:b:12:5" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC pr_unsat_unsat_f_6.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:pr_unsat_unsat_f_6" >> marco.log
echo "done pr_unsat_unsat_f_6"
echo ":model:rl_a_unsat_f_6:b:108:44" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC rl_a_unsat_f_6.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:rl_a_unsat_f_6" >> marco.log
echo "done rl_a_unsat_f_6"
echo ":model:rl_b_unsat_f_6:b:78:44" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC rl_b_unsat_f_6.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:rl_b_unsat_f_6" >> marco.log
echo "done rl_b_unsat_f_6"
echo ":model:rl_c_unsat_f_6:b:96:26" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC rl_c_unsat_f_6.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:rl_c_unsat_f_6" >> marco.log
echo "done rl_c_unsat_f_6"
echo ":model:student_unsat_f_6:b:36:8" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC student_unsat_f_6.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:student_unsat_f_6" >> marco.log
echo "done student_unsat_f_6"
echo ":model:transport_unsat_f_6:b:18:4" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC transport_unsat_f_6.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:transport_unsat_f_6" >> marco.log
echo "done transport_unsat_f_6"


echo ":model:am_unsat_f_12:b:24:4" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC am_unsat_f_12.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:am_unsat_f_12" >> marco.log
echo "done am_unsat_f_12"
echo ":model:car_rental_unsat_f_12:b:108:12" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC car_rental_unsat_f_12.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:car_rental_unsat_f_12" >> marco.log
echo "done car_rental_unsat_f_12"
echo ":model:ds_unsat_f_12:b:48:1" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC ds_unsat_f_12.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:ds_unsat_f_12" >> marco.log
echo "done ds_unsat_f_12"
echo ":model:ehr_a_unsat_f_12:b:108:22" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC ehr_a_unsat_f_12.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:ehr_a_unsat_f_12" >> marco.log
echo "done ehr_a_unsat_f_12"
echo ":model:pr_unsat_unsat_f_12:b:24:5" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC pr_unsat_unsat_f_12.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:pr_unsat_unsat_f_12" >> marco.log
echo "done pr_unsat_unsat_f_12"
echo ":model:rl_a_unsat_f_12:b:288:44" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC rl_a_unsat_f_12.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:rl_a_unsat_f_12" >> marco.log
echo "done rl_a_unsat_f_12"
echo ":model:rl_b_unsat_f_12:b:156:44" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC rl_b_unsat_f_12.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:rl_b_unsat_f_12" >> marco.log
echo "done rl_b_unsat_f_12"
echo ":model:rl_c_unsat_f_12:b:264:26" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC rl_c_unsat_f_12.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:rl_c_unsat_f_12" >> marco.log
echo "done rl_c_unsat_f_12"
echo ":model:student_unsat_f_12:b:72:8" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC student_unsat_f_12.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:student_unsat_f_12" >> marco.log
echo "done student_unsat_f_12"
echo ":model:transport_unsat_f_12:b:36:4" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC transport_unsat_f_12.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:transport_unsat_f_12" >> marco.log
echo "done transport_unsat_f_12"


echo ":model:am_unsat_strict_unbounded:us:0:4" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC am_unsat_strict_unbounded.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:am_unsat_strict_unbounded" >> marco.log
echo "done am_unsat_strict_unbounded"
echo ":model:car_rental_unsat_strict_unbounded:us:0:12" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC car_rental_unsat_strict_unbounded.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:car_rental_unsat_strict_unbounded" >> marco.log
echo "done car_rental_unsat_strict_unbounded"
echo ":model:ds_unsat_strict_unbounded:us:0:1" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC ds_unsat_strict_unbounded.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:ds_unsat_strict_unbounded" >> marco.log
echo "done ds_unsat_strict_unbounded"
echo ":model:ehr_a_unsat_strict_unbounded:us:0:22" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC ehr_a_unsat_strict_unbounded.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:ehr_a_unsat_strict_unbounded" >> marco.log
echo "done ehr_a_unsat_strict_unbounded"
echo ":model:pr_unsat_strict_unbounded:us:0:5" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC pr_unsat_strict_unbounded.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:pr_unsat_strict_unbounded" >> marco.log
echo "done pr_unsat_strict_unbounded"
echo ":model:rl_a_unsat_strict_unbounded:us:0:37" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC rl_a_unsat_strict_unbounded.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:rl_a_unsat_strict_unbounded" >> marco.log
echo "done rl_a_unsat_strict_unbounded"
echo ":model:rl_b_unsat_strict_unbounded:us:0:37" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC rl_b_unsat_strict_unbounded.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:rl_b_unsat_strict_unbounded" >> marco.log
echo "done rl_b_unsat_strict_unbounded"
echo ":model:rl_c_unsat_strict_unbounded:us:0:21" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC rl_c_unsat_strict_unbounded.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:rl_c_unsat_strict_unbounded" >> marco.log
echo "done rl_c_unsat_strict_unbounded"
echo ":model:student_unsat_strict_unbounded:us:0:8" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC student_unsat_strict_unbounded.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:student_unsat_strict_unbounded" >> marco.log
echo "done student_unsat_strict_unbounded"
echo ":model:transport_unsat_strict_unbounded:us:0:3" >> marco.log
systemd-run --scope -p MemoryMax=16G --user $MARCO_EXEC transport_unsat_strict_unbounded.smt2 -avs -T 3600 --threads 1 &>> marco.log
echo ":done:transport_unsat_strict_unbounded" >> marco.log
echo "done transport_unsat_strict_unbounded"


