import { h, Component } from 'preact';
import cx from 'classnames'

export default class Table extends Component {
	render({ className, columnConfig, rows }) { // Open Q. Do obj or positional here?
		/*
			column config:
				columnClass
				style
				label

				column config could take a custom renderer (not good here but could be good for bz?)

				it should handle scroll in a generally acceptable way
					scroll on body - body has column flex grow and overflows to bottom of container
		*/

		let totalFixedColumnPercentage = columnConfig.reduce((total, { columnWidthPercentage }) => total + (columnWidthPercentage || 0), 0)
		if (totalFixedColumnPercentage > 1) { // TODO: should also have is number check here
			throw "Invalid column config. Must not have the sum of the column width percentages exceed 1."
		}

		let numberOfUnfixedColumns = columnConfig.filter(({ columnWidthPercentage }) => !columnWidthPercentage).length
		let sizeOfUnfixedColumn = (1 - totalFixedColumnPercentage) / numberOfUnfixedColumns // TODO: for perf these calculations should really be cached.
		const headerColumns = columnConfig.map(({ label, columnClass, columnWidthPercentage }) => {
			return (
				<div
					className={cx("column-item", columnClass)}
					style={{ width: `${(columnWidthPercentage || sizeOfUnfixedColumn) * 100}%` }}>
					{label}
				</div>
			)
		})

		return (
			<div className={cx('table w-100', className)}>
				<div className="header row flex tl">
					{headerColumns}
				</div>
				{
					rows.map((columnItems) => {
						return (
							<div className="row flex tl">
								{
									columnItems.map((columnItem, colInd) => {
										const { columnClass, columnWidthPercentage } = columnConfig[colInd]
										return (
											<div
												className={cx("column-item", columnClass)}
												style={{width: `${(columnWidthPercentage || sizeOfUnfixedColumn) * 100}%`}}>
												{columnItem}
											</div>
										)
									})
								}
							</div>
						)
					})
				}
			</div>
		)
	}
}
