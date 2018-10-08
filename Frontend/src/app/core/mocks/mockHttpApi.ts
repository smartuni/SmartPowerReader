import {Sensor} from '../interfaces/sensor.interface';
import {Folder} from '../interfaces/folder.interface';

export class MockHttpApi {

  // private static folder: Folder[] = [
  //   {
  //     id: 'myhome',
  //     name: 'My Home',
  //     children: ['livingroom', 'henrybedroom', 'kitchen', 'wareroom', 'mybedroom', 'device1']
  //   },
  //   {
  //     id: 'mycompany',
  //     name: 'My Company',
  //     children: null
  //   },
  //   {
  //     id: 'myparenthome',
  //     name: 'My Parent Home',
  //     children: null
  //   },
  //   {
  //     id: 'livingroom',
  //     name: 'Living Room',
  //     children: ''
  //   },
  //   {
  //     id: 'henrybedroom',
  //     name: 'Henry Bed Room',
  //     children: ''
  //   },
  //   {
  //     id: 'kitchen',
  //     name: 'Kitchen',
  //     children: ''
  //   },
  //   {
  //     id: 'wareroom',
  //     name: 'Wareroom',
  //     children: ''
  //   },
  //   {
  //     id: 'mybedroom',
  //     name: 'My Bed Room',
  //     children: ''
  //   },
  //   {
  //     id: 'device1',
  //     name: 'device A',
  //     children: ''
  //   },
  //   {
  //     id: 'folder1',
  //     name: 'My Home',
  //     children: ''
  //   },
  //
  // ];

  private static computer: Sensor = {
    id: 'computer1',
    name: 'Computer',
    folderName: 'MyCompany',
    frequency: '5',
    frequencyUnit: 's' ,
    series: ''
  };

  private static sensors: Sensor[] = [
    {
      id: 'computer',
      name: 'Computer',
      series: [
        {
          'value': 6429,
          'name': '2016-09-16T13:58:06.918Z'
        },
        {
          'value': 3871,
          'name': '2016-09-17T16:40:52.535Z'
        },
        {
          'value': 5480,
          'name': '2016-09-17T16:48:11.087Z'
        },
        {
          'value': 5696,
          'name': '2016-09-17T10:40:12.815Z'
        },
        {
          'value': 5153,
          'name': '2016-09-18T14:28:59.913Z'
        }
      ]
    },
    {
      id: 'tivi',
      name: 'Tivi',
      series: [
        {
          'value': 2359,
          'name': '2016-09-16T13:58:06.918Z'
        },
        {
          'value': 4922,
          'name': '2016-09-17T16:40:52.535Z'
        },
        {
          'value': 4964,
          'name': '2016-09-17T16:48:11.087Z'
        },
        {
          'value': 5033,
          'name': '2016-09-17T10:40:12.815Z'
        },
        {
          'value': 6650,
          'name': '2016-09-18T14:28:59.913Z'
        }
      ]
    },
    {
      id: 'laptop',
      name: 'Laptop',
      series: [
        {
          'value': 2685,
          'name': '2016-09-16T13:58:06.918Z'
        },
        {
          'value': 4700,
          'name': '2016-09-17T16:40:52.535Z'
        },
        {
          'value': 6600,
          'name': '2016-09-17T16:48:11.087Z'
        },
        {
          'value': 4541,
          'name': '2016-09-17T10:40:12.815Z'
        },
        {
          'value': 4274,
          'name': '2016-09-18T14:28:59.913Z'
        }
      ]
    },
    {
      id: 'xbox',
      name: 'Xbox',
      series: [
        {
          'value': 4645,
          'name': '2016-09-16T13:58:06.918Z'
        },
        {
          'value': 3189,
          'name': '2016-09-17T16:40:52.535Z'
        },
        {
          'value': 5132,
          'name': '2016-09-17T16:48:11.087Z'
        },
        {
          'value': 6102,
          'name': '2016-09-17T10:40:12.815Z'
        },
        {
          'value': 6690,
          'name': '2016-09-18T14:28:59.913Z'
        }
      ]
    },
    {
      id: 'refrigerator',
      name: 'Refrigerator',
      series: [
        {
          'value': 4453,
          'name': '2016-09-16T13:58:06.918Z'
        },
        {
          'value': 3465,
          'name': '2016-09-17T16:40:52.535Z'
        },
        {
          'value': 2337,
          'name': '2016-09-17T16:48:11.087Z'
        },
        {
          'value': 3713,
          'name': '2016-09-17T10:40:12.815Z'
        },
        {
          'value': 4842,
          'name': '2016-09-18T14:28:59.913Z'
        }
      ]
    }
  ];

  public static getSensors() {
    return JSON.parse(JSON.stringify(MockHttpApi.sensors));

  }
}
