<script lang="ts">
	import * as XLSX from 'xlsx'
	let pending = false
	let f: FileList
	function download() {
		let wb = XLSX.utils.table_to_book(document.getElementById('export'))
		XLSX.writeFile(wb, f[0].name.replace('.csv', '-礼物合并总数.csv'))
	}
	function handleChange(elem: HTMLInputElement) {
		const f = elem.files?.[0]
		if (!f) {
			return
		}
		pending = true
		let reader = new FileReader()
		reader.onerror = (e) => {
			alert('读取文件失败')
			console.error(e)
			pending = false
		}
		reader.onload = (e) => {
			Promise.resolve()
				.then(() => {
					let d = e.target!.result
					parse(d as ArrayBuffer)
				})
				.finally(() => {
					pending = false
				})
		}
		reader.readAsArrayBuffer(f)
	}

	import { head, table } from './store'
	import type { Item, Table } from './store'

	function parse(d: ArrayBuffer) {
		let w = XLSX.read(d, { type: 'array' })
		for (let sheet of w.SheetNames) {
			let s = w.Sheets[sheet]
			let j: Item[] = XLSX.utils.sheet_to_json(s, { header: 'A' })
			setTable(j)
			break
		}
	}
	function setTable(items: Item[]) {
		$head = items[0]
		let ntable: Table = {}
		items = items.slice(1)
		for (let item of items) {
			let user = item.B
			let gift = item.C
			ntable[user] = ntable[user] || {}
			let ugifts = ntable[user]
			ugifts[gift] = ugifts[gift] || 0
			ugifts[gift] += 1
		}
		$table = ntable
	}
</script>

<div class="container my-5">
	<form on:submit|preventDefault={download}>
		<div class="mb-3">
			<label for="zptj" class="form-label">请上传经过飞书转换后的转盘统计CSV</label>
			<input
				id="zptj"
				type="file"
				class="form-control"
				accept=".csv"
				required
				disabled={pending}
				bind:files={f}
				on:change={(e) => handleChange(e.currentTarget)}
			/>
		</div>
		<div class="btn-group">
			<button type="submit" class="btn btn-primary" disabled={pending || !$head}>
				下载转换后的文件
			</button>
			<button type="reset" class="btn btn-outline-secondary" disabled={pending}>重置</button>
		</div>
	</form>
	{#if $head}
		<div class="table align-middle" id="export">
			<thead>
				<tr>
					<th>{$head.B}</th>
					<th>{$head.C}</th>
				</tr>
			</thead>
			<tbody>
				{#each Object.entries($table) as [user, gifts]}
					<tr>
						<td>{user}</td>
						<td>
							{#each Object.entries(gifts) as [gift, count]}
								{gift}x{count}<br />
							{/each}
						</td>
					</tr>
				{/each}
			</tbody>
		</div>
	{/if}
</div>
