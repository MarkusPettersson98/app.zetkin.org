import { Box, Grid, Typography } from '@mui/material';
import { Msg, useMessages } from 'core/i18n';

import ActivitiesOverview from 'features/campaigns/components/ActivitiesOverview';
import AllCampaignsLayout from 'features/campaigns/layout/AllCampaignsLayout';
import BackendApiClient from 'core/api/client/BackendApiClient';
import CampaignCard from 'features/campaigns/components/CampaignCard';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import messageIds from 'features/campaigns/l10n/messageIds';
import { PageWithLayout } from 'utils/types';
import { scaffold } from 'utils/next';
import { Suspense } from 'react';
import useCampaigns from 'features/campaigns/hooks/useCampaigns';
import { useNumericRouteParams } from 'core/hooks';
import useServerSide from 'core/useServerSide';

const scaffoldOptions = {
  authLevelRequired: 2,
  localeScope: [
    'layout.organize',
    'misc.breadcrumbs',
    'pages.organizeAllCampaigns',
    'misc.formDialog',
  ],
};

export const getServerSideProps: GetServerSideProps = scaffold(async (ctx) => {
  const { orgId } = ctx.params!;

  const apiClient = new BackendApiClient(ctx.req.headers);
  const orgState = await apiClient.get(`/api/orgs/${orgId}`);

  if (orgState) {
    return {
      props: {},
    };
  } else {
    return {
      notFound: true,
    };
  }
}, scaffoldOptions);

const AllCampaignsSummaryPage: PageWithLayout = () => {
  const messages = useMessages(messageIds);
  const { orgId } = useNumericRouteParams();
  const { data: campaigns } = useCampaigns(orgId);
  campaigns?.reverse();

  const onServer = useServerSide();

  if (onServer) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{messages.layout.allCampaigns()}</title>
      </Head>
      <Suspense>
        <ActivitiesOverview orgId={orgId} />
      </Suspense>
      <Box mt={4}>
        <Typography mb={2} variant="h4">
          <Msg id={messageIds.all.heading} />
        </Typography>

        <Grid container spacing={2}>
          {campaigns?.map((campaign) => {
            return (
              <Grid key={campaign.id} item lg={3} md={4} xs={12}>
                <CampaignCard campaign={campaign} />
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </>
  );
};

AllCampaignsSummaryPage.getLayout = function getLayout(page) {
  return <AllCampaignsLayout>{page}</AllCampaignsLayout>;
};

export default AllCampaignsSummaryPage;
