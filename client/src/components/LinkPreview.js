import * as React from 'react';
import { Text, View, StyleSheet, Image } from 'react';
import './LinkPreview.css';

// function LinkPreview(props) {
//     return (
//     //
//     )
// }

export default class LinkPreview extends React.Component {
    render() {
        return (
            <View class='container'>
                <Text>Hey</Text>
                <Image source={{ uri: 'https://source.unsplash.com/random' }} style={{ height: 50, width: 50 }} />
            </View>
        );
    }
}
