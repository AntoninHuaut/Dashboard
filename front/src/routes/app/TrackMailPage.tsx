import { Stack } from '@mantine/core';

import { TrackMailSettings } from '../../components/trackmail/TrackMailSettings';
import { TrackMailToken } from '../../components/trackmail/TrackMailToken';

export function TrackMailPage() {
    return (
        <>
            <Stack align="center">
                <TrackMailToken rightElement={<TrackMailSettings />} />
            </Stack>
        </>
    );
}
