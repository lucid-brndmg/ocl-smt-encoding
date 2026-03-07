M=$HOME/MARCO/marco.py
L=gen/mus.log

echo "" > $L

$M -avs -T 1800 --threads 1 gen/ae_dep_60.smt2 &>> $L
echo "done"
$M -avs -T 1800 --threads 1 gen/am_unsat_10.smt2 &>> $L
echo "done"

$M -avs -T 1800 --threads 1 gen/am_unsat_20.smt2 &>> $L
echo "done"

$M -avs -T 1800 --threads 1 gen/car_rental_unsat_45.smt2 &>> $L
echo "done"

$M -avs -T 1800 --threads 1 gen/car_rental_unsat_90.smt2 &>> $L
echo "done"

$M -avs -T 1800 --threads 1 gen/ehr2_45.smt2 &>> $L
echo "done"

$M -avs -T 1800 --threads 1 gen/ehr2_90.smt2 &>> $L
echo "done"

$M -avs -T 1800 --threads 1 gen/ehr4_45.smt2 &>> $L
echo "done"

$M -avs -T 1800 --threads 1 gen/ehr4_90.smt2 &>> $L
echo "done"
$M -avs -T 1800 --threads 1 gen/pr_unsat_10.smt2 &>> $L
echo "done"
$M -avs -T 1800 --threads 1 gen/pr_unsat_20.smt2 &>> $L
echo "done"
$M -avs -T 1800 --threads 1 gen/rl_eclipse_unsat_65.smt2 &>> $L
echo "done"
$M -avs -T 1800 --threads 1 gen/rl_eclipse_unsat_130.smt2 &>> $L
echo "done"
$M -avs -T 1800 --threads 1 gen/rl_book_unsat_85.smt2 &>> $L
echo "done"
$M -avs -T 1800 --threads 1 gen/rl_book_unsat_220.smt2 &>> $L
echo "done"
$M -avs -T 1800 --threads 1 gen/rl_wm08_unsat_75.smt2 &>> $L
echo "done"
$M -avs -T 1800 --threads 1 gen/rl_wm08_unsat_200.smt2 &>> $L
echo "done"
$M -avs -T 1800 --threads 1 gen/student_unsat_30.smt2 &>> $L
echo "done"
$M -avs -T 1800 --threads 1 gen/student_unsat_60.smt2 &>> $L
echo "done"


# xs.split("\n").map(it => it.trim()).filter(it => it && !it.startsWith("echo")).map(it => it.slice("$M -avs -T 1800 --threads 1 gen/".length)).map(it => it.slice(0, it.indexOf(".smt2")))