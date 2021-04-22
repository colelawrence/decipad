import React from 'react';
import { Title } from './Title.component';

export default {
  title: 'Dashboard/Pads/Title',
};

export const AllPads = () => <Title text="All Pads" />;

export const Favourites = () => <Title text="Favourites" />;

export const Recents = () => <Title text="Recents" />;

export const RecycleBin = () => <Title text="Recycle Bin" />;
