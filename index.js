const http = require('http');
const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');
const { UNITS, LANGUAGE } = require('./config');

const getCity = () => { 
  return new Promise((resolve, reject) => {
    console.log('Введите название города латиницей');

    const rl = readline.createInterface({ input, output });

    rl.prompt();
    rl.on('line', line => {
      if (line) {
        rl.close();
        resolve(line);
      } 
      rl.prompt();
    });
  });  
};

const getData = (city) => {
  const accessKey = process.env.AccessKey;
  const url = `http://api.weatherstack.com/current?access_key=${accessKey}&query=${city}&units=${UNITS}`;
  
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      const {statusCode} = res;
      if (statusCode !== 200) {
        console.log(`statusCode: ${statusCode}`);
        reject(`statusCode: ${statusCode}`);
      };
  
      res.setEncoding('utf8');
      let rowData = '';
      res.on('data', (chunk) => rowData += chunk);
      res.on('end', () => {
        let parseData = JSON.parse(rowData);
        if (parseData.error) {
          reject(`${parseData.error.info} Error code: ${parseData.error.code}`);
        }
        resolve(parseData);
      });
      res.on('error', (err) => {
        reject(err);
      });
    });
  });
};

const start = async () => {
  try {
    const city = await getCity();
    const data = await getData(city);

    console.log(`Forecast for: ${data.location.name}, ${data.location.country}`);
    console.log(`Current temperature: ${data.current.temperature} ${UNITS === 'm' ? 'Celsius' : UNITS === 's' ? 'Kelvin' : 'Fahrenheit'}`);
    console.log(`Current wind: ${data.current.wind_dir} ${data.current.wind_speed} ${UNITS === 'f' ? 'Miles/hour' : 'Kilometers/Hour'}`);
    console.log(`Current humidity: ${data.current.humidity}%`);
    console.log(`Current pressure: ${data.current.pressure} Millibar`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  };  
};

start();

