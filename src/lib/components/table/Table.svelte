<script>
	import { createTable, Subscribe, Render, createRender } from 'svelte-headless-table';
    import { addSortBy, addPagination, addTableFilter, addSelectedRows } from 'svelte-headless-table/plugins';

    import Chevron from '$lib/icon/Chevron.svelte';
    import Search from '$lib/icon/Search.svelte';

    import { writable, get } from 'svelte/store';

    export let selectedRow = writable({});

    export let data;
    export let columns;

    const table = createTable(data, {
        sort: addSortBy({
			disableMultiSort: true
		}),
		page: addPagination({
			initialPageSize: 50
		}),
        tableFilter: addTableFilter({
            fn: ({ filterValue, value }) => {
                if ('' === filterValue) return true;

                return String(value).toLowerCase().includes(filterValue.toLowerCase());
            }
        }),
        select: addSelectedRows({}),
	});

    let tableColumns = [];
    //todo: fav column
	for (const column of columns) {
        if (column.hasOwnProperty('type') && 'display' === column.type) tableColumns.push(table.display(column));
        else tableColumns.push(table.column(column));
	}

    const viewColumns = table.createColumns(tableColumns);

    const {
        headerRows,
		pageRows,
		tableAttrs,
		tableBodyAttrs,
		pluginStates
	} = table.createViewModel(viewColumns);

    const { pageIndex, pageCount, pageSize, hasNextPage, hasPreviousPage } = pluginStates.page;
    const { filterValue } = pluginStates.tableFilter;
    const { selectedDataIds } = pluginStates.select;

    function selectRow(row) {
        selectedDataIds.clear();

        if (get(selectedRow) !== row.original) {
            const {isSelected} = pluginStates.select.getRowState(row);
            isSelected.set(true);

            selectedRow.set(row.original);
        }
        else {
            selectedRow.set({});
		}
    }
</script>

<div class="flex w-full justify-between py-4 md:px-8">
	<div>
		<div class="bg-slate-600 py-1 px-2 flex items-center">
			<Search />
			<input type="text" class="bg-transparent appearance-none border-0 ml-2 outline-none" bind:value={$filterValue} placeholder="Search..." />
		</div>

	</div>
</div>

<table class="w-full text-sm" {...$tableAttrs}>
	<thead class="bg-emerald-700">
	{#each $headerRows as headerRow (headerRow.id)}
		<Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
			<tr {...rowAttrs}>
				{#each headerRow.cells as cell (cell.id)}
					<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
						<th class="px-4 py-1 hover:cursor-pointer" {...attrs} on:click={props.sort.toggle}>
							<div class="inline-flex items-center">
								<Render of={cell.render()} />
								{#if !props.sort.disabled}
									<div class="inline-flex flex-col w-2 ml-2 text-xs">
										{#if 'asc' === props.sort.order}
											<Chevron direction="down" />
										{:else if 'desc' === props.sort.order}
											<Chevron direction="up" />
										{:else}
											<Chevron direction="up" />
											<Chevron direction="down" />
										{/if}
									</div>
								{/if}
							</div>
						</th>
					</Subscribe>
				{/each}
			</tr>
		</Subscribe>
	{/each}
	</thead>
	<tbody {...$tableBodyAttrs}>
	{#each $pageRows as row (row.id)}
		<Subscribe rowAttrs={row.attrs()} rowProps={row.props()} let:rowAttrs let:rowProps>
			<tr {...rowAttrs} on:click={() => selectRow(row)} class:bg-dark-green={rowProps.select.selected} class="hover:cursor-pointer" class:hover:bg-neutral-600={!rowProps.select.selected}>
				{#each row.cells as cell (cell.id)}
					<Subscribe attr={cell.attrs()} let:attrs>
						<td class="px-4 py-1" {...attrs}>
							<Render of={cell.render()} />
						</td>
					</Subscribe>
				{/each}
			</tr>
		</Subscribe>
	{/each}
	</tbody>
</table>
<div class="p-4 w-full flex justify-end flex-row">
	<span class="block mx-4">{$pageIndex + 1} out of {$pageCount}</span>
	<span class="block mx-4 w-2" on:click={() => {
        if ($hasPreviousPage) $pageIndex--;
	}} class:cursor-pointer={$hasPreviousPage} class:cursor-not-allowed={!$hasPreviousPage} class:text-neutral-600={!$hasPreviousPage}>
		<Chevron direction="left" />
	</span>
	<span class="block mx-4 w-2" on:click={() => {
        if ($hasNextPage) $pageIndex++;
	}} class:cursor-pointer={$hasNextPage} class:cursor-not-allowed={!$hasNextPage} class:text-neutral-600={!$hasNextPage}>
		<Chevron direction="right" />
	</span>
</div>