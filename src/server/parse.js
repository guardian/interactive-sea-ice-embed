import tar from 'tar-fs'
import fs from 'fs'
import fetch from 'node-fetch'
import { createGunzip } from 'gunzip-stream'
import AWS from 'aws-sdk'

const url = 'http://psc.apl.uw.edu/wordpress/wp-content/uploads/schweiger/ice_volume/PIOMAS.vol.daily.1979.2018.Current.v2.1.dat.gz'

const s3 = new AWS.S3()

const s3Params = {
    Bucket: "gdn-cdn",
    ACL: "public-read",
    ContentType: "application/json",
    CacheControl: "max-age=300" // 15 seconds (prod ready)
}

const parse = str => {

    const data = str.split('\n')
        .slice(1)
        .filter( row => row !== '' )

    const filtered = data
        .map( row => {

            const arr = row.split(/\s+/g)
            return { year : Number(arr[0]), day : Number(arr[1]), vol : Number(arr[2]) }

        })
        .filter( (d, i, arr) => d.day % 5 === 1 || d.day === arr.filter( d2 => d2.year === d.year ).slice(-1)[0].day )

    console.log(`Found data for ${data.length} days`)

    const obj = Object.assign({}, s3Params, { Key : 'interactive-sea-ice/latest.json', Body : JSON.stringify(filtered) } ) 

    s3.putObject( obj, (err, info) => {

        if(!err) { console.log (`Successfully wrote to S3 (${new Date()})`) }

    } )

}

fetch(url)
    .then( res => {

        let str = ''

        res.body
            .pipe(createGunzip())
            .on('data', buf => {

                const chunk = buf.toString()
                str += chunk

            })
            .on('end', () => {

                parse(str)

            })
        

    } )