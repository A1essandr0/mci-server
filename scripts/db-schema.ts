
export const dropTablesQuery = {
    text: `
        DROP TABLE IF EXISTS users CASCADE;
        DROP TABLE IF EXISTS presets CASCADE;
        DROP TABLE IF EXISTS cards;
    `
};

export const createTablesQuery = {
    text: `
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            email VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(200) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
            is_admin INTEGER NOT NULL DEFAULT 0,
            is_teacher INTEGER NOT NULL DEFAULT 0,
            presets_owned INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE presets (
            id SERIAL PRIMARY KEY,
            owner_id INTEGER NOT NULL,
            owner_name VARCHAR(50),
            name VARCHAR(50) UNIQUE NOT NULL, 
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
            is_playable_by_all INTEGER NOT NULL DEFAULT 1,
            is_viewable_by_all INTEGER NOT NULL DEFAULT 1,
            is_viewable_by_users INTEGER NOT NULL DEFAULT 1,
    
            card_back VARCHAR(100),
            card_empty VARCHAR(100),
            description VARCHAR(1000),

            CONSTRAINT fk_owner_id
                FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
        );

        CREATE TABLE cards (
            id SERIAL PRIMARY KEY,
            preset_id INTEGER NOT NULL,
            value VARCHAR(100) NOT NULL,
            filename VARCHAR(100) NOT NULL,
            info VARCHAR(1000),
    
            CONSTRAINT fk_preset_id
                FOREIGN KEY (preset_id) REFERENCES presets (id) ON DELETE CASCADE                
        );
    `
}

export const createAdminQuery = {
    text: `
        INSERT INTO users (name, email, password, is_admin, is_teacher) VALUES ($1, $2, $3, $4, $5);
    `,
    values: ['admin','admin@admin.com', '', 1, 1]
}

export const createUserQuery = {
    text: `
        INSERT INTO users (name, email, password) VALUES ($1, $2, $3);

    `,
    values: ['va','va@va.com', '']
}

export const createPresetsQuery = {
    text: `
        INSERT INTO presets (owner_id, owner_name, name, is_playable_by_all, is_viewable_by_all, is_viewable_by_users, card_back, card_empty, description) VALUES (1,  'admin', 'English synonyms one', 1, 1, 1, 'back.png', 'empty.png', 'English synonyms');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (1, 'aback', 'Aback.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (1, 'aback', 'by suprise.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (1, 'boorish', 'Boorish.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (1, 'boorish', 'crude.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (1, 'capricious', 'Capricious.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (1, 'capricious', 'impulsive.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (1, 'direful', 'Direful.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (1, 'direful', 'dreadful.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (1, 'elated', 'Elated.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (1, 'elated', 'joyful.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (1, 'irate', 'Irate.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (1, 'irate', 'enraged.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (1, 'placid', 'Placid.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (1, 'placid', 'calm.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (1, 'tacit', 'Tacit.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (1, 'tacit', 'implied.png', 'none');

        INSERT INTO presets (owner_id, owner_name, name, is_playable_by_all, is_viewable_by_all, is_viewable_by_users, card_back, card_empty, description) VALUES (1, 'admin', 'English synonyms two', 1, 1, 1, 'back.png', 'empty.png', 'English synonyms');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (2, 'vivacious', 'Vivacious.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (2, 'vivacious', 'vigorous.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (2, 'corpulent', 'Corpulent.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (2, 'corpulent', 'obese.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (2, 'comely', 'Comely.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (2, 'comely', 'attractive.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (2, 'friable', 'Friable.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (2, 'friable', 'brittle.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (2, 'irksome', 'Irksome.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (2, 'irksome', 'annoying.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (2, 'luminous', 'Luminous.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (2, 'luminous', 'shining.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (2, 'nefarious', 'Nefarious.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (2, 'nefarious', 'wicked.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (2, 'sagacious', 'Sagacious.png', 'none');
        INSERT INTO cards (preset_id, value, filename, info) VALUES (2, 'sagacious', 'wise.png', 'none');
    `        
}

//////

export const dbSchemaSqlite = `
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS presets;
    DROP TABLE IF EXISTS cards;

    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

        is_admin INTEGER NOT NULL DEFAULT 0,
        is_teacher INTEGER NOT NULL DEFAULT 0,
        presets_owned INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE presets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id INTEGER NOT NULL,
        owner_name TEXT,
        name TEXT UNIQUE NOT NULL, 
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

        is_playable_by_all INTEGER NOT NULL DEFAULT 1,
        is_viewable_by_all INTEGER NOT NULL DEFAULT 1,
        is_viewable_by_users INTEGER NOT NULL DEFAULT 1,

        card_back TEXT,
        card_empty TEXT,
        description TEXT,

        CONSTRAINT fk_owner_id
        FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        preset_id INTEGER NOT NULL,
        value TEXT NOT NULL,
        filename TEXT NOT NULL,
        info TEXT,

        CONSTRAINT fk_preset_id
        FOREIGN KEY (preset_id) REFERENCES presets (id) ON DELETE CASCADE
    );
`

export const defaultPresetsSqlite = `
INSERT INTO presets VALUES(2,1,'admin','Birds','2021-08-17 13:39:20',1,1,1,'back','empty','Various bird images without annotations');
INSERT INTO presets VALUES(6,1,'admin','Antonyms uno','2021-08-15 12:02:33',1,1,1,'back','empty','Basic english antonyms');
INSERT INTO presets VALUES(10,1,'admin','Synonyms uno','2021-08-15 12:25:23',1,0,1,'back','empty','A bit sophisticated english synonyms');
INSERT INTO presets VALUES(12,1,'admin','Synonyms due','2021-08-15 12:30:56',1,0,1,'back','empty','A bit sophisticated english synonyms');
INSERT INTO presets VALUES(15,1,'admin','Synonyms tre','2021-08-15 12:37:19',1,0,1,'back','empty','A bit sophisticated english synonyms');
INSERT INTO presets VALUES(17,1,'admin','Chemical elements','2021-08-16 22:43:31',1,1,1,'back','empty','Chemical elements and their respective english denominations');
INSERT INTO presets VALUES(18,1,'admin','Body parts uno','2021-08-17 12:47:05',1,1,1,'back','empty','Upper body parts');
INSERT INTO presets VALUES(19,1,'admin','Body parts due','2021-08-17 12:50:21',1,1,1,'back','empty','Lower body parts');

INSERT INTO cards VALUES(75,6,'1','035031f7568be26d2a67bbd2ab0d2ab4.png','n/a');
INSERT INTO cards VALUES(76,6,'2','721686cb29590f30b805c458b5451bdc.png','n/a');
INSERT INTO cards VALUES(77,6,'3','0007561a9b9bd6b646c381b079e6be7e.png','n/a');
INSERT INTO cards VALUES(78,6,'4','f4108da43206fd67c25fc9bbe6932278.png','n/a');
INSERT INTO cards VALUES(79,6,'5','700fabd418fb31ece546d79421816a2c.png','n/a');
INSERT INTO cards VALUES(80,6,'6','94198b7888e1733b918b5622f516bff5.png','n/a');
INSERT INTO cards VALUES(81,6,'7','7de526ff4ce5da1352eec29833ca8d98.png','n/a');
INSERT INTO cards VALUES(82,6,'8','1cac9e4d76440f1d23254fd97230c374.png','n/a');
INSERT INTO cards VALUES(83,6,'9','1d827690a7b216434dab217821cbaf9b.png','n/a');
INSERT INTO cards VALUES(84,6,'0','f0e8de2b981c5a22fddbe39c9b16aa9d.png','n/a');
INSERT INTO cards VALUES(85,6,'1','43c4bd12b53e12d60761998c4ec9b476.png','n/a');
INSERT INTO cards VALUES(86,6,'2','d84d2eda58c6eb291c2538447fca2c0e.png','n/a');
INSERT INTO cards VALUES(87,6,'3','2868c7d9090855248f18c61a4631f964.png','n/a');
INSERT INTO cards VALUES(88,6,'4','0e6263a3fe916805f966f202d5ae4cdd.png','n/a');
INSERT INTO cards VALUES(89,6,'5','ef79e90f7ed0121088d780107306a387.png','n/a');
INSERT INTO cards VALUES(90,6,'6','8c1a62b68fb7ed89a3dd6616a360ef9a.png','n/a');
INSERT INTO cards VALUES(91,6,'7','3a7a372232ab8542bb44530e91128db6.png','n/a');
INSERT INTO cards VALUES(92,6,'8','bc27becf2fafd63a40af9ca50a8c8e88.png','n/a');
INSERT INTO cards VALUES(93,6,'9','3abe2265d2d71905cbd22ec67e606852.png','n/a');
INSERT INTO cards VALUES(94,6,'0','079a0e26d964ca5d5c62b820f2b03ae3.png','n/a');
INSERT INTO cards VALUES(113,10,'1','e4412000cdb518fffdf1b8d33859f0ef.png','n/a');
INSERT INTO cards VALUES(114,10,'2','a459d2ffde59038e486895f4bf4a0aa6.png','n/a');
INSERT INTO cards VALUES(115,10,'3','f5cfe373c62e830523b63a6fa837d17f.png','n/a');
INSERT INTO cards VALUES(116,10,'4','25a8dd7ea5e4e0fd3c2665994d0069f1.png','n/a');
INSERT INTO cards VALUES(117,10,'5','e25945c51323dc5de07545505ce904e1.png','n/a');
INSERT INTO cards VALUES(118,10,'6','185dab94f250d1b81299f39d080ec7de.png','n/a');
INSERT INTO cards VALUES(119,10,'7','b2d09c5a8b7ea7c773135822b21c4c28.png','n/a');
INSERT INTO cards VALUES(120,10,'1','0d8ec5d9fbfa9d7402fec63bef22490f.png','n/a');
INSERT INTO cards VALUES(121,10,'2','2cffd8b53197d1506cc0623fd3c9fc9e.png','n/a');
INSERT INTO cards VALUES(122,10,'3','96af42f68a4c40720ca117913bf1d3a5.png','n/a');
INSERT INTO cards VALUES(123,10,'4','824f550644d88fa3cdbddaa8d61ad47d.png','n/a');
INSERT INTO cards VALUES(124,10,'5','52afc5236f4899ba197567bb173e3282.png','n/a');
INSERT INTO cards VALUES(125,10,'6','e4f64a19b0275fa1889176b8bbebf283.png','n/a');
INSERT INTO cards VALUES(126,10,'7','033f3b8b4d976db11c5a3669cecca4d4.png','n/a');
INSERT INTO cards VALUES(141,12,'1','88b9181708ded3cedd921b01e2c7093f.png','n/a');
INSERT INTO cards VALUES(142,12,'2','83b5f9c4022da21ac98f7095394f79c9.png','n/a');
INSERT INTO cards VALUES(143,12,'3','db3eac5a5bd31d279274b81dd5d0abe1.png','n/a');
INSERT INTO cards VALUES(144,12,'4','f4e0ce9a8144135b0cc6e9aff8c6709a.png','n/a');
INSERT INTO cards VALUES(145,12,'5','1167238b944c0906b04d08bbb41ea90a.png','n/a');
INSERT INTO cards VALUES(146,12,'6','cad4924ce2fa0a4f53f0a5f77f869c6f.png','n/a');
INSERT INTO cards VALUES(147,12,'1','4718950f48c251fad48ecbaff3bc7fd0.png','n/a');
INSERT INTO cards VALUES(148,12,'2','f8289604199032e2f97ec4cb6a546ee4.png','n/a');
INSERT INTO cards VALUES(149,12,'3','9b360c8783be04be050432dd06e9a4a8.png','n/a');
INSERT INTO cards VALUES(150,12,'4','23b91f9541c57c8fca2e73fcb1b95fe0.png','n/a');
INSERT INTO cards VALUES(151,12,'5','f297c50dbfe4b3ffc39178e44659b38c.png','n/a');
INSERT INTO cards VALUES(152,12,'6','522d23b41270fbe5bc03b37b19bcca1b.png','n/a');
INSERT INTO cards VALUES(169,15,'1','cc84c6e3f0c99a0156ec2992aeff285e.png','n/a');
INSERT INTO cards VALUES(170,15,'2','d94d9a52a45bec0df89a50b840571a6e.png','n/a');
INSERT INTO cards VALUES(171,15,'3','d58d553bfb66b97850c89ba8fd949778.png','n/a');
INSERT INTO cards VALUES(172,15,'4','85483adf93ff344c84fa8a44527337c7.png','n/a');
INSERT INTO cards VALUES(173,15,'5','bb1b75dde68310001cb6df76da0cfffa.png','n/a');
INSERT INTO cards VALUES(174,15,'6','333fd5b535c32c91f51f382afd170b16.png','n/a');
INSERT INTO cards VALUES(175,15,'7','6581e6078cff2e99553c7e3ce9e42122.png','n/a');
INSERT INTO cards VALUES(176,15,'1','03e55c2bc7cf723536134b798ccf0108.png','n/a');
INSERT INTO cards VALUES(177,15,'2','8e2fc451fe7e9e54dc42ad8583f9f014.png','n/a');
INSERT INTO cards VALUES(178,15,'3','3acf12e8ed55888d7c66690c9c48a12e.png','n/a');
INSERT INTO cards VALUES(179,15,'4','fd2252daa3cc094d0912522b2ecb10d0.png','n/a');
INSERT INTO cards VALUES(180,15,'5','0ba5ca7c58a7fa22ec058f67a26cc936.png','n/a');
INSERT INTO cards VALUES(181,15,'6','436b8471307fb290ac987f76af1893fb.png','n/a');
INSERT INTO cards VALUES(182,15,'7','ccc0e95956aff1130b189818051883ef.png','n/a');
INSERT INTO cards VALUES(189,17,'1','cff712004337a74bb0860e9d13516d47.png','n/a');
INSERT INTO cards VALUES(190,17,'2','7c262a04723b2cee5bf9745a5bc8ac43.png','n/a');
INSERT INTO cards VALUES(191,17,'3','6980096389a9b73e8e0f51f48971cc35.png','n/a');
INSERT INTO cards VALUES(192,17,'4','9e6e74d9ce0248b16421ca057f5c7208.png','n/a');
INSERT INTO cards VALUES(193,17,'5','b94fa36b404517555826dfcd09bd4132.png','n/a');
INSERT INTO cards VALUES(194,17,'6','80c6f5fff72c5240ffeb4103f6980bea.png','n/a');
INSERT INTO cards VALUES(195,17,'1','6a9fc6d3ca7d7872f268296ff97b1590.png','n/a');
INSERT INTO cards VALUES(196,17,'2','62441a80f6913b63937b7341be01673e.png','n/a');
INSERT INTO cards VALUES(197,17,'3','a315bd38f23b096682d62af9a9561a51.png','n/a');
INSERT INTO cards VALUES(198,17,'4','7b0a8bfdd515156577f1953e7bb2d4b7.png','n/a');
INSERT INTO cards VALUES(199,17,'5','71a21b3d25d6833356737053a816d06e.png','n/a');
INSERT INTO cards VALUES(200,17,'6','8a2d374152408ea5ce6a98d00d68e183.png','n/a');
INSERT INTO cards VALUES(201,18,'1','727ce7ae7763e787d9c3498dff97d78f.jpeg','n/a');
INSERT INTO cards VALUES(202,18,'2','bf483f57d8809217322482c1d2cd9f1e.jpeg','n/a');
INSERT INTO cards VALUES(203,18,'3','00a0aead0b5ae4034e4e0bdbd6d31550.jpeg','n/a');
INSERT INTO cards VALUES(204,18,'4','e0c3291f6c2db18aedc4220d01889ba9.jpeg','n/a');
INSERT INTO cards VALUES(205,18,'5','ee47b1b80d53f353aa348f74f914ff52.jpeg','n/a');
INSERT INTO cards VALUES(206,18,'6','7d124a14f8b974ef338a54f54ee925a5.jpeg','n/a');
INSERT INTO cards VALUES(207,18,'7','5140be09c6f3c8f592bd7b83d6ad7197.jpeg','n/a');
INSERT INTO cards VALUES(208,18,'8','991cbbf4e52b6976775770b491e9ec97.jpeg','n/a');
INSERT INTO cards VALUES(209,18,'1','981640fa9c9ec3560f4a571175510064.png','n/a');
INSERT INTO cards VALUES(210,18,'2','fa9fddbb4183f8b0478bdb3103bd2faa.png','n/a');
INSERT INTO cards VALUES(211,18,'3','30f096940142e16ac182584395da7aeb.png','n/a');
INSERT INTO cards VALUES(212,18,'4','1b9f8423093cdcddf665475351d67b58.png','n/a');
INSERT INTO cards VALUES(213,18,'5','e97805c70cd104a68a09bff5469f9fb4.png','n/a');
INSERT INTO cards VALUES(214,18,'6','6057767b17b521b8abe883f71db765a4.png','n/a');
INSERT INTO cards VALUES(215,18,'7','6e75df3b43ba203d304a10d96280a943.png','n/a');
INSERT INTO cards VALUES(216,18,'8','f6b94a14a4cf82084d5261e31a90b52d.png','n/a');
INSERT INTO cards VALUES(217,19,'1','f60be221b1a1f40d8a4a10654a99a906.jpeg','n/a');
INSERT INTO cards VALUES(218,19,'2','e1e670d8c7667fb53d5e9c3965be0ebd.jpeg','n/a');
INSERT INTO cards VALUES(219,19,'3','a632c362229cde771c8fe60f8fc0333d.jpeg','n/a');
INSERT INTO cards VALUES(220,19,'4','7c580e0539b71d05d9fa12f03e3982c1.jpeg','n/a');
INSERT INTO cards VALUES(221,19,'5','46c078afab8259a431103b9e4388434d.jpeg','n/a');
INSERT INTO cards VALUES(222,19,'6','07683aa4de758ed87a03a41a1f27b0a0.jpeg','n/a');
INSERT INTO cards VALUES(223,19,'7','981563e4b4000964aec8196d20fc646c.jpeg','n/a');
INSERT INTO cards VALUES(224,19,'8','4d74983a862b475ef25140112d5c908b.jpeg','n/a');
INSERT INTO cards VALUES(225,19,'1','92697c2e74c2833d17f069a7b6e92d11.png','n/a');
INSERT INTO cards VALUES(226,19,'2','a9709f871281c0e54774f6807f0b5ccd.png','n/a');
INSERT INTO cards VALUES(227,19,'3','07074c78386e36cae1ca6d972c9da3d0.png','n/a');
INSERT INTO cards VALUES(228,19,'4','3a2592bdb9dc23099cd1ef983410c679.png','n/a');
INSERT INTO cards VALUES(229,19,'5','0f44f8c420c4d9a83c50f8cbbed3e723.png','n/a');
INSERT INTO cards VALUES(230,19,'6','a7b8354930f3548d3b3d067566a89adf.png','n/a');
INSERT INTO cards VALUES(231,19,'7','5cb45863d578df05d74a4af2c57e37a2.png','n/a');
INSERT INTO cards VALUES(232,19,'8','4d089925cabe3536b88f00526bc607c0.png','n/a');
INSERT INTO cards VALUES(233,2,'1','c9ab252c05ad98124a86b7ac66ce3fb5.jpeg','n/a');
INSERT INTO cards VALUES(234,2,'2','3d49a87c4df6e2a6be35de6a6c6e0079.jpeg','n/a');
INSERT INTO cards VALUES(235,2,'3','d04c0bf5a26b38785045d04764bda362.jpeg','n/a');
INSERT INTO cards VALUES(236,2,'4','3f9e28335eeaa37e28e1facb737c85cb.jpeg','n/a');
INSERT INTO cards VALUES(237,2,'5','84e36ebe3030c8f2ece539678380d9f9.jpeg','n/a');
INSERT INTO cards VALUES(238,2,'6','0d324726585e134545933fe401a92399.jpeg','n/a');
INSERT INTO cards VALUES(239,2,'7','41b10e62923813dda9b44fd04033a317.jpeg','n/a');
INSERT INTO cards VALUES(240,2,'8','956381270e8dc4e62d33b8abc7a28991.jpeg','n/a');
INSERT INTO cards VALUES(241,2,'1','3b43804181750a176acc9b5b8882df19.png','n/a');
INSERT INTO cards VALUES(242,2,'2','a0d22dbb5c64ccf86f89015c16bd1c24.png','n/a');
INSERT INTO cards VALUES(243,2,'3','e2f8e17cc4f23d3ddf5d459bf9d076c5.png','n/a');
INSERT INTO cards VALUES(244,2,'4','42d9a21772a896a43709aad1c7327884.png','n/a');
INSERT INTO cards VALUES(245,2,'5','051f1f0307ca80c9b7f4112d35e255de.png','n/a');
INSERT INTO cards VALUES(246,2,'6','eaa01512b2d5926577b1587bdc9ba992.png','n/a');
INSERT INTO cards VALUES(247,2,'7','2e28106a49dc0de289d7bcfac3b8c930.png','n/a');
INSERT INTO cards VALUES(248,2,'8','f81fe49f19c085815c01f52b08baddaa.png','n/a');
`