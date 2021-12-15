import { Alert } from '@material-ui/lab';
import { FormattedMessage } from 'react-intl';
import { FunctionComponent } from 'react';
import NProgress from 'nprogress';
import { Person } from '@material-ui/icons';
import { Snackbar } from '@material-ui/core';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { DataGridPro, GridColDef } from '@mui/x-data-grid-pro';
import { useMutation, useQueryClient } from 'react-query';

import { colIdFromFieldName } from './utils';
import deleteViewColumn from 'fetching/views/deleteViewColumn';
import patchViewColumn from 'fetching/views/patchViewColumn';
import postViewColumn from 'fetching/views/postViewColumn';
import { SelectedViewColumn } from 'types/views';
import { VIEW_DATA_TABLE_ERROR } from './constants';
import ViewRenameColumnDialog from '../ViewRenameColumnDialog';
import ViewColumnDialog, { AUTO_SAVE_TYPES } from 'components/views/ViewColumnDialog';
import ViewDataTableColumnMenu, { ViewDataTableColumnMenuProps } from './ViewDataTableColumnMenu';
import ViewDataTableToolbar, { ViewDataTableToolbarProps } from './ViewDataTableToolbar';
import { ZetkinViewColumn, ZetkinViewRow } from 'types/zetkin';


interface ViewDataTableProps {
    columns: ZetkinViewColumn[];
    rows: ZetkinViewRow[];
    viewId: string;
}

const ViewDataTable: FunctionComponent<ViewDataTableProps> = ({ columns, rows, viewId }) => {
    const [columnToConfigure, setColumnToConfigure] = useState<SelectedViewColumn | null>(null);
    const [columnToRename, setColumnToRename] = useState<ZetkinViewColumn | null>(null);
    const [error, setError] = useState<VIEW_DATA_TABLE_ERROR>();
    const { orgId } = useRouter().query;
    const queryClient = useQueryClient();

    const addColumnMutation = useMutation(postViewColumn(orgId as string, viewId), {
        onError: () => {
            setError(VIEW_DATA_TABLE_ERROR.CREATE_COLUMN);
            NProgress.done();
        },
        onSettled: () => {
            NProgress.done();
            queryClient.invalidateQueries(['views', viewId]);
        },
    });

    const updateColumnMutation = useMutation(patchViewColumn(orgId as string, viewId), {
        onError: () => {
            setError(VIEW_DATA_TABLE_ERROR.MODIFY_COLUMN);
            NProgress.done();
        },
        onSettled: () => {
            NProgress.done();
            queryClient.invalidateQueries(['views', viewId]);
        },
    });

    const removeColumnMutation = useMutation(deleteViewColumn(orgId as string, viewId), {
        onError: () => {
            setError(VIEW_DATA_TABLE_ERROR.DELETE_COLUMN);
            NProgress.done();
        },
        onSettled: () => {
            NProgress.done();
            queryClient.invalidateQueries(['views', viewId]);
        },
        onSuccess: () => {
            queryClient.removeQueries(['views', viewId, 'rows']);
        },
    });

    const onColumnCancel = () => {
        setColumnToConfigure(null);
    };

    const onColumnSave = async (colSpec : SelectedViewColumn) => {
        setColumnToConfigure(null);
        NProgress.start();
        if ('id' in colSpec) { // If is an existing column, PATCH it with changed values
            // Get existing column
            const columnPreEdit = columns.find(col => col.id === colSpec.id);
            if (!columnPreEdit) {
                setError(VIEW_DATA_TABLE_ERROR.MODIFY_COLUMN);
                return;
            }
            // Extract out only fields which changed
            const changedFields: Partial<ZetkinViewColumn> = {};
            Object.entries(colSpec).forEach(([key, value]) => {
                const typedKey = key as keyof ZetkinViewColumn;
                if (columnPreEdit[typedKey] !== value) {
                    changedFields[typedKey] = value;
                }
            });
            await updateColumnMutation.mutateAsync({
                ...changedFields,
                id: colSpec.id,
            },
            );
        }
        else { // If it's a new view, POST a new column
            await addColumnMutation.mutateAsync({
                config: colSpec.config,
                title: colSpec.title,
                type: colSpec.type,
            });
        }
    };

    const onColumnConfigure = (colFieldName : string) => {
        const colId = colIdFromFieldName(colFieldName);
        const colSpec = columns.find(col => col.id === colId) || null;
        setColumnToConfigure(colSpec);
    };

    const onColumnCreate = () => {
        setColumnToConfigure({});
    };

    const onColumnDelete = async (colFieldName : string) => {
        const colId = colIdFromFieldName(colFieldName);
        await removeColumnMutation.mutateAsync(colId);
    };

    const onColumnRename = (colFieldName : string) => {
        const colId = colIdFromFieldName(colFieldName);
        const colSpec = columns.find(col => col.id === colId) || null;
        setColumnToRename(colSpec);
    };

    const onColumnRenameSave = async (column : Pick<ZetkinViewColumn, 'id' | 'title'>) => {
        setColumnToRename(null);
        await updateColumnMutation.mutateAsync({
            id: column.id,
            title: column.title,
        });
    };

    const avatarColumn : GridColDef = {
        disableColumnMenu: true,
        disableExport: true,
        disableReorder: true,
        field: 'id',
        filterable: false,
        headerName: ' ',
        renderCell: (params) => {
            const url = `/api/orgs/1/people/${params.value}/avatar`;
            return (
                <img
                    alt="Avatar"
                    src={ url }
                    style={{
                        maxHeight: '100%',
                        maxWidth: '100%',
                    }}
                />
            );
        },
        renderHeader: () => {
            return <Person/>;
        },
        resizable: false,
        sortable: false,
        width: 50,
    };

    const gridColumns = [
        avatarColumn,
        ...columns.map((col) => ({
            field: `col_${col.id}`,
            headerName: col.title,
            minWidth: 200,
        })),
    ];

    const gridRows = rows.map(input => {
        const output : Record<string,unknown> = {
            id: input.id,
        };
        input.content.forEach((cellValue, colIndex) => {
            const col = columns[colIndex];
            const fieldName = `col_${col.id}`;
            output[fieldName] = cellValue;
        });

        return output;
    });

    const componentsProps: {
        columnMenu: ViewDataTableColumnMenuProps;
        toolbar: ViewDataTableToolbarProps;
    } = {
        columnMenu: {
            onConfigure: onColumnConfigure,
            onDelete: onColumnDelete,
            onRename: onColumnRename,
            showConfigureButton: (field: GridColDef['field']): boolean => {
                const colId = colIdFromFieldName(field);
                const column = columns.find(column => column.id === colId);
                if (column) {
                    return !AUTO_SAVE_TYPES.includes(column.type);
                }
                return false;
            },
        },
        toolbar: {
            onColumnCreate,
        },
    };

    return (
        <>
            <DataGridPro
                columns={ gridColumns }
                components={{
                    ColumnMenu: ViewDataTableColumnMenu,
                    Toolbar: ViewDataTableToolbar,
                }}
                componentsProps={ componentsProps }
                rows={ gridRows }
            />
            { columnToRename && (
                <ViewRenameColumnDialog
                    column={ columnToRename }
                    onCancel={ () => setColumnToRename(null) }
                    onSave={ onColumnRenameSave }
                />
            ) }
            { columnToConfigure && (
                <ViewColumnDialog
                    onCancel={ onColumnCancel }
                    onSave={ onColumnSave }
                    selectedColumn={ columnToConfigure }
                />
            ) }
            { /* Error alert */ }
            <Snackbar
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                data-testid="data-table-error-indicator"
                onClose={ () => setError(undefined) }
                open={ Boolean(error) }>
                <Alert severity="error">
                    <FormattedMessage id={ `misc.views.dataTableErrors.${error}` } />
                </Alert>
            </Snackbar>
        </>
    );
};

export default ViewDataTable;