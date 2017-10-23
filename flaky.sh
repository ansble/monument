if [[ -z "$1" ]]; then
  com="npm run mocha"
else
  com="mocha $1"
fi

for run in {1..50}
do
  $com
done
