'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/context/AuthContext';
import { DataStore } from '../../lib/services/store';
import { Song, Setlist } from '../../lib/types';
import {
  Music,
  Plus,
  Search,
  BookOpen,
  ListMusic,
  ExternalLink,
  Tag,
  KeyRound,
  FileText
} from 'lucide-react';

export function SongModule() {
  const [songs, setSongs] = useState<Song[]>(() => DataStore.getSongs());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showAddSongModal, setShowAddSongModal] = useState(false);

  // New Song Form
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [originalKey, setOriginalKey] = useState('G');
  const [bpm, setBpm] = useState(72);
  const [lyrics, setLyrics] = useState('');

  const handleSaveSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !artist) return;
    const newSong = DataStore.saveSong({
      title,
      artist,
      originalKey,
      bpm,
      lyrics
    });
    setSongs(DataStore.getSongs());
    setShowAddSongModal(false);
    setTitle('');
    setArtist('');
    setLyrics('');
  };

  const filteredSongs = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Music className="w-5 h-5 text-indigo-400" />
            Worship Song Library & Setlist Builder
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Store song lyrics, chords, BPM, keys, audio links, and build event setlists.
          </p>
        </div>

        <button
          onClick={() => setShowAddSongModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Song</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search song title, artist, or tags (e.g. Goodness of God, Worship)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Main Grid: Song List + Lyrics Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Song Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSongs.map((song) => (
            <div
              key={song.id}
              onClick={() => setSelectedSong(song)}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">{song.title}</h3>
                  <p className="text-xs text-slate-400">{song.artist}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                  {song.originalKey}
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span>BPM: {song.bpm}</span>
                <span>Language: {song.language}</span>
                <span className="text-indigo-400 font-semibold">{song.difficulty}</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {song.tags.map((t, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right 1 Col: Selected Song Lyrics & Chords Drawer */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          {selectedSong ? (
            <>
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] font-bold text-indigo-400">Song Sheet View</span>
                <h3 className="font-bold text-base text-white">{selectedSong.title}</h3>
                <p className="text-xs text-slate-400">{selectedSong.artist} | Key: {selectedSong.originalKey} | {selectedSong.bpm} BPM</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-300">Lyrics Preview</div>
                <pre className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl text-slate-200 font-mono whitespace-pre-wrap leading-relaxed text-[11px] max-h-80 overflow-y-auto">
                  {selectedSong.lyrics || 'No lyrics stored for this song yet.'}
                </pre>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select a song from the library to view lyrics and chord sheets.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
