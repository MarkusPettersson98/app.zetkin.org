import { Autocomplete as MUIAutocomplete } from '@material-ui/lab';
import { Autocomplete as RFFAutocomplete } from 'mui-rff';
import { useIntl } from 'react-intl';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Avatar, Box, TextField, Typography } from '@material-ui/core';
import React, { FunctionComponent, ReactElement, useEffect, useState } from 'react';

import getPeopleSearchResults from 'fetching/getPeopleSearchResults';
import useDebounce from 'hooks/useDebounce';
import { ZetkinPerson } from 'types/zetkin';


interface UsePersonSelectProps {
    label?: string;
    name?: string;
    onChange: (person: ZetkinPerson) => void;
    placeholder?: string;
    selectedPerson: ZetkinPerson | null;
}

interface UsePersonSelectReturn {
    autoCompleteProps: {
        filterOptions: (options: ZetkinPerson[]) => ZetkinPerson[];
        getOptionLabel: (person: ZetkinPerson) => string;
        getOptionSelected: (option: ZetkinPerson, value: ZetkinPerson) => boolean;
        getOptionValue: (person: ZetkinPerson) => unknown;
        label: string | undefined;
        name: string;
        noOptionsText: string;
        onChange: (ev: unknown, value: string | ZetkinPerson | (string | ZetkinPerson)[] | null) => void;
        onInputChange: (ev: unknown, value: string) => void;
        options: ZetkinPerson[];
        placeholder?: string;
        renderOption: (person: ZetkinPerson) => ReactElement;
        value: ZetkinPerson | null;
    };
}

type UsePersonSelect = (props: UsePersonSelectProps) => UsePersonSelectReturn;

type PersonSelectProps = UsePersonSelectProps;

const usePersonSelect: UsePersonSelect = ({
    label,
    name,
    onChange,
    placeholder,
    selectedPerson,
}) => {
    const intl = useIntl();
    const { orgId } = useRouter().query;
    const [searchFieldValue, setSearchFieldValue] = useState<string>('');

    const { isLoading, refetch, data: results } = useQuery(
        ['peopleSearchResults', searchFieldValue],
        getPeopleSearchResults(searchFieldValue, orgId as string),
        { enabled: false },
    );

    let searchLabel = searchFieldValue.length ?
        intl.formatMessage({ id: 'misc.personSelect.keepTyping' }) :
        intl.formatMessage({ id: 'misc.personSelect.search' });

    if (isLoading) {
        searchLabel = intl.formatMessage({ id: 'misc.personSelect.searching' });
    }
    else if (results?.length == 0) {
        searchLabel = intl.formatMessage({ id: 'misc.personSelect.noResult' });
    }

    const debouncedQuery = useDebounce(async () => {
        refetch();
    }, 600);

    // Watch for changes on the search field value and debounce search if changed
    useEffect(() => {
        if (searchFieldValue.length >= 3) {
            debouncedQuery();
        }
    }, [searchFieldValue.length, debouncedQuery]);

    let personOptions = (results || []) as ZetkinPerson[];
    if (selectedPerson && !personOptions.some(o => o.id === selectedPerson.id)) {
        personOptions = [selectedPerson as ZetkinPerson].concat(personOptions);
    }

    return {
        autoCompleteProps: {
            filterOptions: options => options,
            getOptionLabel: (person: ZetkinPerson) => person.first_name? `${person.first_name} ${person.last_name}` : '',
            getOptionSelected: (option: ZetkinPerson, value: ZetkinPerson) => option?.id == value?.id,
            getOptionValue: (person: ZetkinPerson) => person.id || null,
            label,
            name: name || '',
            noOptionsText: searchLabel,
            onChange: (ev, value) => {
                onChange(value as ZetkinPerson);
            },
            onInputChange: (ev: unknown, value: string) => {
                setSearchFieldValue(value);
            },
            options: personOptions,
            placeholder,
            renderOption: (person: ZetkinPerson) => (
                <Box alignItems="center" display="flex">
                    <Box m={ 1 }>
                        <Avatar
                            src={ `/api/orgs/${orgId}/people/${person.id}/avatar` }>
                        </Avatar>
                    </Box>
                    <Typography>
                        { `${ person.first_name } ${ person.last_name }` }
                    </Typography>
                </Box>
            ),
            value: selectedPerson,
        },
    };
};

// TODO: Remove once mui-rff has been retired
const PersonSelect: FunctionComponent<PersonSelectProps & { name: string }> = (props) => {
    const {
        autoCompleteProps,
    } = usePersonSelect(props);

    return (
        <RFFAutocomplete
            { ...autoCompleteProps }
        />
    );
};

export default PersonSelect;

const MUIOnlyPersonSelect: FunctionComponent<PersonSelectProps> = (props) => {
    const {
        autoCompleteProps,
    } = usePersonSelect(props);

    const {
        name,
        placeholder,
        ...restProps
    } = autoCompleteProps;

    return (
        <MUIAutocomplete
            { ...restProps }
            renderInput={ params => (
                <TextField
                    { ...params }
                    inputProps={{
                        ...params.inputProps,
                    }}
                    name={ name }
                    placeholder={ placeholder }
                    variant="outlined"
                />
            ) }
        />
    );
};

export { MUIOnlyPersonSelect };