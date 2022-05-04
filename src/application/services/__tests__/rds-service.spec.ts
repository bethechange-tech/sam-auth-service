describe('Passing test', () => {
  it.todo('Passes');
});

// import RDSService from '../rds-service'
// import ExperienceModel from '../../infrastructure/database/pg/postgres-connection'
// import { mocked } from 'ts-jest/dist/utils/testing';

// jest.mock('data-api-client', () => jest.fn(() => jest.fn))

// jest.mock('../../infrastructure/database/pg/postgres-connection');
// const mockedExperienceModel = mocked(ExperienceModel);

// // function setExperienceModelMockReturnValue(
// //   experience: any
// // ): void {
// //   mockedExperienceModel.query.mockReturnValue({
// //     lean: jest.fn().mockResolvedValue(experience),
// //   } as any);

// // }

// describe('RDSService Class', () => {
//   beforeEach(async () => {
//     process.env.JWT_SECRET = 'somesecretpossiblyssl'
//     process.env.JWT_EXPIRES_IN = '30d'
//   })

//   afterEach(() => jest.clearAllMocks())

//   it('should return response successfully and grant acces if user is found', async () => {
//     const rdsService = new RDSService()
//     mockedExperienceModel.query.mockResolvedValueOnce({
//       records: [
//         {
//           name: 'danile baker',
//           age: 24,
//           email: 'fakeemail@fakeemail.com',
//           role: 'admin',
//         },
//       ],
//     })

//     await rdsService.create({ id: 'id', email: 'email', password: 'password' })


//     // expect(
//     //   rdsService.create({ id: 'id', email: 'email', password: 'password' })
//     // ).toEqual(
//     //   `INSERT INTO user (id,email,password) VALUES(:id,:email,:password)`
//     // )
//   })
// })
