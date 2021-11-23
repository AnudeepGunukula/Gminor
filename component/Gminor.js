import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, FlatList, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import TrackPlayer, {
    Capability,
    Event,
    RepeatMode,
    State,
    usePlaybackState,
    useProgress,
    useTrackPlayerEvents,
} from 'react-native-track-player';

import Slider from '@react-native-community/slider';

import { songs } from '../model/data';

const { width, height } = Dimensions.get('window');


const setupPlayer = async () => {
    await TrackPlayer.setupPlayer();
    // await TrackPlayer.updateOptions({
    //     capabilities: [
    //         Capability.Play,
    //         Capability.Pause,
    //         Capability.SkipToNext,
    //         Capability.SkipToPrevious,
    //         Capability.Stop,
    //     ],
    // });

    await TrackPlayer.add(songs);


}

const togglePlayback = async (playbackState) => {
    const currentTrack = await TrackPlayer.getCurrentTrack();

    if (currentTrack != null) {
        if (playbackState == State.Paused) {
            await TrackPlayer.play();
        }
        else {
            await TrackPlayer.pause();
        }
    }
}

const Gminor = () => {

    const playbackState = usePlaybackState();
    const progress = useProgress();
    const [trackArtwork, setTrackArtwork] = useState();
    const [trackArtist, setTrackArtist] = useState();
    const [trackTitle, setTrackTitle] = useState();
    const scrollX = useRef(new Animated.Value(0)).current;
    const [songIndex, setSongIndex] = useState(0);
    const [repeatMode, setRepeatMode] = useState('off');

    const songSlider = useRef(null);

    useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
        if (event.type == Event.PlaybackTrackChanged && event.nextTrack != null) {
            const track = await TrackPlayer.getTrack(event.nextTrack);
            const { title, image, artist } = track;
            setTrackTitle(title);
            setTrackArtwork(image)
            setTrackArtist(artist);
        }
    })

    const repeatIcon = () => {
        if (repeatMode == 'off') {
            return 'repeat-off';
        }
        if (repeatMode == 'track') {
            return 'repeat-once';
        }
        if (repeatMode == 'repeat') {
            return 'repeat';
        }

    }

    const changeRepeatMode = () => {
        if (repeatMode == 'off') {
            TrackPlayer.setRepeatMode(RepeatMode.Track);
            setRepeatMode('track');
        }
        if (repeatMode == 'track') {
            TrackPlayer.setRepeatMode(RepeatMode.Queue);
            setRepeatMode('repeat');
        }
        if (repeatMode == 'repeat') {
            TrackPlayer.setRepeatMode(RepeatMode.Off);
            setRepeatMode('off');
        }
    }
    const skipTo = async (trackId) => {
        await TrackPlayer.skip(trackId);
    }

    useEffect(() => {
        setupPlayer();

        scrollX.addListener(({ value }) => {
            const index = Math.round(value / width);
            skipTo(index);
            setSongIndex(index);
        });

        return () => {
            scrollX.removeAllListeners();
        }
    }, []);

    const skipToNext = () => {
        songSlider.current.scrollToOffset(
            {
                offset: (songIndex + 1) * width,
            }
        );
    }

    const skipToPrevious = () => {
        songSlider.current.scrollToOffset(
            {
                offset: (songIndex - 1) * width,
            }
        );
    }
    const renderSongs = ({ index, item }) => {
        return (
            <Animated.View style={{
                width: width,
                justifyContent: 'center',
                alignItems: 'center'
            }}>

                <View style={styles.artworkWrapper}>
                    <Image
                        source={trackArtwork}
                        style={styles.artworkImg}
                    />

                </View>

            </Animated.View>

        );
    }

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.maincontainer}>

                <View style={{ width: width }}>
                    <Animated.FlatList

                        ref={songSlider}
                        data={songs}
                        renderItem={renderSongs}
                        keyExtractor={(item) => item.id}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        scrollEventThrottle={16}
                        onScroll={Animated.event(
                            [{
                                nativeEvent: {
                                    contentOffset: { x: scrollX }
                                }
                            }],
                            { useNativeDriver: true }
                        )}

                    />
                </View>

                <View>
                    <Text style={styles.title}>{trackTitle}</Text>
                    <Text style={styles.artist}>{trackArtist}</Text>
                </View>
                <View>
                    <Slider
                        style={styles.progessContainer}
                        value={progress.position}
                        minimumValue={0}
                        maximumValue={progress.duration}
                        thumbTintColor="#FFD369"
                        minimumTrackTintColor="#00ffff"
                        MaximumTrackTintColor="#FFF"
                        onSlidingComplete={async (value) => {
                            await TrackPlayer.seekTo(value);
                        }}


                    />
                    <View style={styles.progressLabelContainer}>
                        <Text style={styles.progressLabelText}>
                            {new Date(progress.position * 1000).toISOString().substr(14, 5)}
                        </Text>
                        <Text style={styles.progressLabelText}>
                            {new Date((progress.duration - progress.position) * 1000).toISOString().substr(14, 5)}
                        </Text>
                    </View>
                </View>

                <View style={styles.musicControls}>
                    <TouchableOpacity onPress={skipToPrevious}>
                        <Ionicons name="play-skip-back-outline" size={35} color='#00ffff' />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => togglePlayback(playbackState)}>
                        <Ionicons name={playbackState == State.Playing ? "ios-pause-circle" : "ios-play-circle"} size={75} color='#00ffff' />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={skipToNext}>
                        <Ionicons name="play-skip-forward-outline" size={35} color='#00ffff' />
                    </TouchableOpacity>
                </View>


            </View>
            <View style={styles.bottomContainer}>
                <View style={styles.bottomControls}>
                    <TouchableOpacity onPress={() => { }}>
                        <Ionicons name="heart-outline" size={30} color='#777777' />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={changeRepeatMode}>
                        <MaterialCommunityIcons name={`${repeatIcon()}`} size={30} color={repeatMode != 'off' ? '#FFD369' : '#777777'} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { }}>
                        <Ionicons name="share-outline" size={30} color='#777777' />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { }}>
                        <Ionicons name="ellipsis-horizontal" size={30} color='#777777' />
                    </TouchableOpacity>


                </View>
            </View>
        </SafeAreaView>

    );
}


export default Gminor;

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#222831'
    },
    maincontainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    bottomContainer:
    {
        borderTopColor: '#393E46',
        borderTopWidth: 1,
        width: width,
        alignItems: 'center',
        paddingVertical: 15
    },
    bottomControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%'
    },
    artworkWrapper: {
        width: 300,
        height: 340,
        marginBottom: 25,

    },
    artworkImg: {
        width: '100%',
        height: '100%',
        borderRadius: 15
    },
    title:
    {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        color: '#EEEEEE'

    },
    artist: {
        fontSize: 16,
        fontWeight: '200',
        textAlign: 'center',
        color: '#FFD369'
    },
    progessContainer: {
        width: 350,
        height: 40,
        marginTop: 25,
        flexDirection: 'row'
    },
    progressLabelContainer:
    {
        width: 340,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressLabelText: {
        color: '#FFF'
    },
    musicControls: {
        flexDirection: 'row',
        width: '60%',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10
    }




});