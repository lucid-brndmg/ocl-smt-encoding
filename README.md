# Verifying OCL Constraints with Complex Data Types

This repository contains materials of "Verifying OCL Constraints with Complex Data Types". 

## REPRODUCING

The following instructions show how to reproduce our evaluation results of Section 4. Each step produces a CSV table corresponds to the tables in the paper. We provide samples of these CSV tables in the `fmlgen` directory already. 

### Requirements

A Linux operating system that supports systemd and **at least 10GB of disk space** is required. 
It is recommended for the environment to have at least 16GB of RAM. 
Please install/confirm the following command is available (as each set to `$PATH`). 

- The [Bun JavaScript Runtime](https://bun.com/): confirm by the `bun` command
- The [Z3 SMT solver (4.16.0)](https://github.com/Z3Prover/z3/releases/tag/z3-4.16.0): confirm by the `z3` command
- The [CVC5 SMT solver (1.3.3)](https://github.com/cvc5/cvc5/releases/tag/cvc5-1.3.3): confirm by the `cvc5` command
- The systemd support: confirm by the `systemd-run` command (for limiting RAM usage on solving)

Additionally, the second experiment (inconsistency investigation) require [the MARCO tool](https://github.com/liffiton/marco/) to be cloned into the `$HOME` directory:
```shell
cd ~
git clone https://github.com/liffiton/MARCO.git
```
Further installation of MARCO requires the [`z3-solver` Python package](https://pypi.org/project/z3-solver/) to be installed. If not, install it by:
```shell
pip install z3-solver
```

Then compile MARCO by the following:
```shell
cd MARCO
cd src/pyminisolvers
make
make test
```

Please ensure the `python3 ~/MARCO/marco.py` command shows no error.

### Step 0: Preparations

Clone and switch into this repository by:
```shell
git clone https://github.com/lucid-brndmg/ocl-smt-encoding.git
cd ocl-smt-encoding
```

The `fmlgen` directory contains scripts, modules and the DSL of our selected encodings and cases.
**All the following steps should be run inside the `fmlgen` directory.**

```shell
cd fmlgen
```

#### (Optional) Using Pre-Generated SMT Formulas

Extract the contents (SMT2 files) of `fmlgen/pre-gen-formulas/fml.zip` into the `fmlgen/gen` folder. These files are formulas that are used in our experiments. If using this, one may skip the relevant formula generation commands in the following steps. 

### Step 1: Consistency Checking

The following steps reproduces Table 2 and Table 3 of the first experiment.
Please confirm the current working directory is `fmlgen`, and execute the following:

**SKIP this step if using the pre-generated formulas.**
```shell
# clear previous shell files
rm gen/z3*.sh gen/cvc*.sh

./gen_check.sh
```

This generates the SMT formulas for both encodings. 
For large bounds, there might be out-of-memory errors and please ignore them. This can take several minutes.

After the previous command is finished, please run the following command for performing the SMT solving. **WARN: SMT solving can take hours to be fully completed.**
```shell
./exec_step1.sh
```
If it takes too long, one can separately/parallel run each line of the command in this script. 

After it is finished, the relevant solving logs are generated inside the `gen/` directory. One can read them for specific information. The following script gathers these logs and produce a CSV table:

```shell
bun run csv_check_table.js
```

This generates 2 files `step1_sat.csv, step1_unsat.csv` at the `fmlgen` folder. These CSV tables corresponds to the results of Table 2 and 3 of the paper.

### Step 2: Inconsistency Investigation

This step produces Table 4 on finding MUS and MSS.
Ensure the MARCO tool is already installed, and the formulas are generated from the previous step. 

Run the following command to perform MUS and MSS finding using the MARCO tool:

```shell
./exec_step2.sh
```
**WARN: SMT solving can take hours to be fully completed.**
This script assumes the `MARCO` directory is cloned in `$HOME`. One may change its location manually by editing the `MARCO_EXEC` within this script. 

When the command is finished, use the following command to generate the CSV file of Table 4:
```shell
bun run csv_marco_table.js
```

This generates a `step2.csv` corresponds to Table 4. 

### Step 3: Instance Generation

This step reproduces Table 5 of the instance generation experiment. 
In `fmlgen` directory, run the following to generate relevant formulas:

**Skip this step if using the pre-generated formulas.**

```shell
bun run codegen_ig.js
```

Then use SMT solvers to generate instances by:
```shell
cd gen
./igb.sh # generate instances for bounded formulas
./igu.sh # generate instances for unbounded formulas
cd .. # switch back to the fmlgen directory
```
**WARN: SMT solving can take hours to be fully completed.**

After finished, run the following command to generate the CSV file:
```shell
# in the fmlgen folder
bun run csv_ig_table.js
```

This generates `step3.csv` that corresponds to Table 5. 