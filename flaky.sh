if [[ -z "$1" ]]; then
  com="npm run ava"
else
  com="ava $1"
fi

for run in {1..50}
do
  $com
done
