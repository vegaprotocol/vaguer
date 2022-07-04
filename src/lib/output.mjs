import { statsWeCareAbout } from './check.mjs'
import { printTable } from 'console-table-printer'

export async function output(stats) {
	printTable(stats)	
}