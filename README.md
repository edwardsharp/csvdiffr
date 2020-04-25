# csvdiffr

csv diff util

a little thingy to diff .csv files.

you can upload two files: the first (file A) is the short (and possibly outdated) list of products that you created. the second file (file B) is the larger price sheet with all the products and possibly new prices. this script will collect all the values from the first column in file A and then go through all the rows in file B and check if the value in the first column is the same as a value from the first column in file A; and if they are the same, will return the row. so you will end up with the rows in file B that have the same value in the first column (the assumption is that's the UNF identifier, so any two files you upload you need to make sure the value in the first column can match).

\ ゜ o ゜)ノ

## see GLITCH

see a working demo of this over on glitch!

[glitch.com/~descriptive-seeder](https://glitch.com/~descriptive-seeder)

### docker notez

see [3dwardsharp/csvdiffr](https://hub.docker.com/r/3dwardsharp/csvdiffr/) on docker HUB.

```
docker build -t 3dwardsharp/csvdiffr .
docker run -p 3000:3000 --env PORT=3000 3dwardsharp/csvdiffr
```
