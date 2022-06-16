import fetch from 'node-fetch'
import Airtable from 'airtable'
import fs from 'fs/promises'

const getUrl = (city, revenue) =>
  `https://cities.bythenumbers.sco.ca.gov/api/${
    revenue ? 'revenue' : 'opex'
  }/chart_data.json?page=0&limit=15&sort_field=total&sort=desc&year=2020&child_entity=org2&org1=${encodeURIComponent(
    city
  )}`
const base = new Airtable({ apiKey: process.env.AIRTABLE_KEY }).base(
  'appbSueVU5l3hHAiA'
)

const budgets = {}

;(async () => {
  const cities = await base('Cities').select().all()
  for (const city of cities) {
    console.log(city.get('Name'))
    budgets[city.getId()] = { revenue: null, expenditures: null }
    budgets[city.getId()].revenue = await fetch(
      getUrl(city.get('Name'), true)
    ).then((response) => response.json())
    budgets[city.getId()].expenditures = await fetch(
      getUrl(city.get('Name'), false)
    ).then((response) => response.json())
  }
  await fs.writeFile('./_data/budgets.json', JSON.stringify(budgets, null, 2))
})()
